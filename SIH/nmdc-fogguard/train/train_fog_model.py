"""
NMDC FogGuard – Complete Training Pipeline
==========================================
Train fog detection model using open-source RESIDE + FRIDA2 datasets.
Model: EfficientNet-B0 (fog density classifier) + YOLOv8n (obstacle detector)

Usage:
    python train_fog_model.py --epochs 100 --batch-size 32 --device cuda
"""

import os, sys, argparse, json, time
from pathlib import Path
import numpy as np
import cv2
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset, WeightedRandomSampler
from torchvision import datasets, transforms
import timm
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# ── Suppress warnings ──────────────────────────────────────────────────
import warnings; warnings.filterwarnings("ignore")

# ── Class Mapping ──────────────────────────────────────────────────────
CLASS_NAMES = ["CLEAR", "MODERATE", "DENSE", "CRITICAL"]
VISIBILITY_MAP = {
    "CLEAR":    (60, 100),   # visibility range in meters
    "MODERATE": (20, 60),
    "DENSE":    (5, 20),
    "CRITICAL": (1, 5),
}


def get_args():
    p = argparse.ArgumentParser(description="NMDC FogGuard Training Script")
    p.add_argument("--data-dir",   default="./data/processed",  help="Processed dataset directory")
    p.add_argument("--model-dir",  default="./models",          help="Output model directory")
    p.add_argument("--epochs",     type=int, default=100)
    p.add_argument("--batch-size", type=int, default=32)
    p.add_argument("--lr",         type=float, default=3e-4)
    p.add_argument("--img-size",   type=int, default=224)
    p.add_argument("--device",     default="auto",  choices=["auto","cpu","cuda","mps"])
    p.add_argument("--backbone",   default="efficientnet_b0", help="timm model name")
    p.add_argument("--patience",   type=int, default=10,  help="Early stopping patience")
    p.add_argument("--skip-yolo",  action="store_true", help="Skip YOLOv8 training")
    p.add_argument("--workers",    type=int, default=4)
    p.add_argument("--seed",       type=int, default=42)
    return p.parse_args()


def seed_everything(seed):
    """Keep comparisons between dataset/model runs reproducible."""
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def build_stratified_datasets(data_dir, train_tf, val_tf, seed):
    """Split by class while keeping independent train and evaluation transforms."""
    train_source = datasets.ImageFolder(str(data_dir), transform=train_tf)
    val_source = datasets.ImageFolder(str(data_dir), transform=val_tf)
    labels = np.asarray(train_source.targets)
    indices = np.arange(len(labels))
    train_indices, remainder = train_test_split(
        indices, test_size=0.20, stratify=labels, random_state=seed
    )
    val_indices, test_indices = train_test_split(
        remainder, test_size=0.50, stratify=labels[remainder], random_state=seed
    )
    train_labels = labels[train_indices]
    class_counts = np.bincount(train_labels, minlength=len(train_source.classes))
    class_weights = np.zeros_like(class_counts, dtype=np.float64)
    np.divide(1.0, class_counts, out=class_weights, where=class_counts > 0)
    sample_weights = torch.as_tensor(class_weights[train_labels], dtype=torch.double)
    sampler = WeightedRandomSampler(sample_weights, len(sample_weights), replacement=True)
    return (
        Subset(train_source, train_indices),
        Subset(val_source, val_indices),
        Subset(val_source, test_indices),
        sampler,
        class_counts,
    )


def resolve_device(pref):
    if pref == "auto":
        if torch.cuda.is_available():    return "cuda"
        if torch.backends.mps.is_available(): return "mps"
        return "cpu"
    return pref


# ── Dataset Transforms ─────────────────────────────────────────────────
def get_transforms(img_size):
    mean = [0.485, 0.456, 0.406]
    std  = [0.229, 0.224, 0.225]

    train_tf = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.1),
        transforms.ColorJitter(brightness=0.35, contrast=0.35, saturation=0.25, hue=0.05),
        transforms.RandomRotation(15),
        transforms.RandomGrayscale(p=0.05),  # simulate sensor dropout
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std),
        transforms.RandomErasing(p=0.1, scale=(0.02, 0.1)),  # simulate sensor noise
    ])

    val_tf = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std),
    ])

    return train_tf, val_tf


# ── Model Builder ──────────────────────────────────────────────────────
def build_model(backbone, num_classes, pretrained=True):
    """Build EfficientNet-based fog classifier with custom head."""
    model = timm.create_model(backbone, pretrained=pretrained, num_classes=num_classes)

    # Custom classification head for fog detection
    in_features = model.get_classifier().in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 256),
        nn.GELU(),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes)
    )

    return model


# ── Trainer Class ──────────────────────────────────────────────────────
class FogGuardTrainer:
    def __init__(self, model, device, lr, patience):
        self.model = model.to(device)
        self.device = device
        self.criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
        self.optimizer = torch.optim.AdamW(
            model.parameters(), lr=lr, weight_decay=1e-4
        )
        self.patience = patience
        self.history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}
        self.best_val_acc = 0.0
        self.patience_counter = 0

    def train_epoch(self, loader):
        self.model.train()
        total_loss, correct, total = 0, 0, 0
        for imgs, labels in loader:
            imgs, labels = imgs.to(self.device), labels.to(self.device)
            self.optimizer.zero_grad()
            out = self.model(imgs)
            loss = self.criterion(out, labels)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            self.optimizer.step()
            total_loss += loss.item() * imgs.size(0)
            correct += (out.argmax(1) == labels).sum().item()
            total += imgs.size(0)
        return total_loss / total, correct / total

    def val_epoch(self, loader):
        self.model.eval()
        total_loss, correct, total = 0, 0, 0
        all_preds, all_labels = [], []
        with torch.no_grad():
            for imgs, labels in loader:
                imgs, labels = imgs.to(self.device), labels.to(self.device)
                out = self.model(imgs)
                loss = self.criterion(out, labels)
                total_loss += loss.item() * imgs.size(0)
                preds = out.argmax(1)
                correct += (preds == labels).sum().item()
                total += imgs.size(0)
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
        return total_loss / total, correct / total, all_preds, all_labels

    def fit(self, train_loader, val_loader, epochs, model_dir, scheduler=None):
        model_dir = Path(model_dir)
        model_dir.mkdir(parents=True, exist_ok=True)
        best_model_path = model_dir / "fogguard_best.pt"

        print(f"\n{'='*60}")
        print(f"  NMDC FogGuard Training — {epochs} Epochs")
        print(f"  Device: {self.device} | Classes: {CLASS_NAMES}")
        print(f"{'='*60}\n")

        for epoch in range(1, epochs + 1):
            t0 = time.time()

            train_loss, train_acc = self.train_epoch(train_loader)
            val_loss, val_acc, preds, labels = self.val_epoch(val_loader)

            if scheduler:
                scheduler.step()

            self.history["train_loss"].append(train_loss)
            self.history["train_acc"].append(train_acc)
            self.history["val_loss"].append(val_loss)
            self.history["val_acc"].append(val_acc)

            elapsed = time.time() - t0
            print(
                f"Epoch {epoch:3d}/{epochs} | "
                f"Loss {train_loss:.4f}/{val_loss:.4f} | "
                f"Acc {train_acc:.3f}/{val_acc:.3f} | "
                f"{elapsed:.1f}s"
            )

            # Save best
            if val_acc > self.best_val_acc:
                self.best_val_acc = val_acc
                torch.save({
                    "epoch": epoch,
                    "model_state": self.model.state_dict(),
                    "optimizer_state": self.optimizer.state_dict(),
                    "val_acc": val_acc,
                    "classes": CLASS_NAMES
                }, best_model_path)
                print(f"  ✅ Saved best model (val_acc={val_acc:.4f})")
                self.patience_counter = 0
            else:
                self.patience_counter += 1
                if self.patience_counter >= self.patience:
                    print(f"\n⏹ Early stopping at epoch {epoch} (patience={self.patience})")
                    break

        print(f"\n✅ Training complete! Best Val Accuracy: {self.best_val_acc:.4f}")
        return self.history

    def evaluate(self, test_loader):
        """Full evaluation with classification report."""
        _, acc, preds, labels = self.val_epoch(test_loader)
        print(f"\n📊 Test Accuracy: {acc:.4f}")
        print("\nClassification Report:")
        print(classification_report(labels, preds, target_names=CLASS_NAMES))
        return acc, preds, labels

    def plot_history(self, save_path=None):
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
        fig.patch.set_facecolor("#050a14")
        for ax in [ax1, ax2]:
            ax.set_facecolor("#0a1628")
            ax.tick_params(colors="#8ba6c1")
            ax.spines[:].set_color("#1a3a5c")

        ax1.plot(self.history["train_loss"], color="#ff6b1a", label="Train Loss")
        ax1.plot(self.history["val_loss"],   color="#00d4ff", label="Val Loss")
        ax1.set_title("Loss", color="#e8f4fd", fontsize=13)
        ax1.legend(labelcolor="#8ba6c1")

        ax2.plot(self.history["train_acc"], color="#ff6b1a", label="Train Acc")
        ax2.plot(self.history["val_acc"],   color="#00d4ff", label="Val Acc")
        ax2.set_title("Accuracy", color="#e8f4fd", fontsize=13)
        ax2.legend(labelcolor="#8ba6c1")

        plt.suptitle("NMDC FogGuard Training History", color="#ff6b1a", fontsize=15)
        plt.tight_layout()
        if save_path:
            plt.savefig(save_path, dpi=120, bbox_inches="tight")
            print(f"✅ Training curve saved: {save_path}")
        plt.show()


# ── Inference Helper ───────────────────────────────────────────────────
def predict_frame(model, frame_bgr, device, img_size=224):
    """Predict fog class from a single OpenCV frame (BGR)."""
    mean = np.array([0.485, 0.456, 0.406])
    std  = np.array([0.229, 0.224, 0.225])

    img = cv2.resize(frame_bgr, (img_size, img_size))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    img = (img - mean) / std
    tensor = torch.tensor(img.transpose(2, 0, 1), dtype=torch.float32).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(tensor)
        probs  = torch.softmax(logits, dim=1).squeeze().cpu().numpy()

    pred_idx = int(np.argmax(probs))
    fog_class = CLASS_NAMES[pred_idx]
    confidence = float(probs[pred_idx])

    # Estimate visibility
    vis_range = VISIBILITY_MAP[fog_class]
    visibility_m = int(vis_range[0] + (1 - confidence) * (vis_range[1] - vis_range[0]))

    return {
        "fog_class": fog_class,
        "confidence": confidence,
        "visibility_m": visibility_m,
        "probabilities": {c: float(p) for c, p in zip(CLASS_NAMES, probs)},
    }


# ── Video Analysis ─────────────────────────────────────────────────────
def analyze_video(model, video_path, device, output_path=None, sample_rate=2):
    """Analyze a video file and annotate with fog detection."""
    cap = cv2.VideoCapture(str(video_path))
    fps   = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height= int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    results = []
    frame_idx = 0

    if output_path:
        out = cv2.VideoWriter(
            str(output_path),
            cv2.VideoWriter_fourcc(*"mp4v"),
            fps, (width, height)
        )

    print(f"\n🎬 Analyzing: {video_path} ({total} frames @ {fps:.1f}fps)")

    FOG_COLORS = {
        "CLEAR":    (0, 230, 118),
        "MODERATE": (64, 215, 255),
        "DENSE":    (26, 107, 255),
        "CRITICAL": (59, 59, 255),
    }

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break

        if frame_idx % max(1, int(fps / sample_rate)) == 0:
            result = predict_frame(model, frame, device)
            results.append({"frame": frame_idx, "time": frame_idx / fps, **result})

            if output_path:
                color = FOG_COLORS[result["fog_class"]]

                # HUD overlay
                cv2.rectangle(frame, (0, 0), (width, 60), (5, 10, 20), -1)
                cv2.putText(frame, f"FOGGUARD: {result['fog_class']}",
                            (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 2)
                cv2.putText(frame, f"Visibility: {result['visibility_m']}m  Conf: {result['confidence']:.1%}",
                            (10, 55), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (180, 200, 220), 1)

                if result["fog_class"] in ("DENSE", "CRITICAL"):
                    text = "REDUCE SPEED" if result["fog_class"] == "DENSE" else "HALT ALL VEHICLES"
                    cv2.rectangle(frame, (0, height-50), (width, height), (0, 0, 180), -1)
                    cv2.putText(frame, f"⚠ {text}", (10, height-15),
                                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)

            print(f"  Frame {frame_idx:5d}/{total} → {result['fog_class']} "
                  f"({result['confidence']:.2%}) | {result['visibility_m']}m")

        if output_path:
            out.write(frame)

        frame_idx += 1

    cap.release()
    if output_path:
        out.release()
        print(f"\n✅ Annotated video saved: {output_path}")

    # Summary
    if results:
        from collections import Counter
        class_counts = Counter(r["fog_class"] for r in results)
        dominant = class_counts.most_common(1)[0][0]
        avg_vis  = np.mean([r["visibility_m"] for r in results])
        print(f"\n📊 Video Analysis Summary:")
        print(f"   Frames analyzed: {len(results)}")
        print(f"   Dominant class:  {dominant}")
        print(f"   Avg Visibility:  {avg_vis:.1f}m")
        print(f"   Class counts:    {dict(class_counts)}")

    return results


# ── Main ───────────────────────────────────────────────────────────────
def main():
    args = get_args()
    seed_everything(args.seed)
    device = resolve_device(args.device)
    print(f"[FogGuard] Device: {device}")

    # Validate data directory
    data_dir = Path(args.data_dir)
    if not data_dir.exists():
        print(f"❌ Data directory not found: {data_dir}")
        print("   Run: python dataset_prep.py first")
        sys.exit(1)

    # Transforms
    train_tf, val_tf = get_transforms(args.img_size)

    # Dataset: stratification and independent transforms prevent validation leakage.
    train_ds, val_ds, test_ds, sampler, class_counts = build_stratified_datasets(
        data_dir, train_tf, val_tf, args.seed
    )
    print(f"[FogGuard] Dataset: {len(train_ds) + len(val_ds) + len(test_ds)} images")
    print(f"[FogGuard] Train distribution: {dict(zip(CLASS_NAMES, class_counts.tolist()))}")

    pin_memory = device == "cuda"
    train_loader = DataLoader(train_ds, batch_size=args.batch_size, sampler=sampler, num_workers=args.workers, pin_memory=pin_memory)
    val_loader   = DataLoader(val_ds,   batch_size=args.batch_size, shuffle=False, num_workers=args.workers, pin_memory=pin_memory)
    test_loader  = DataLoader(test_ds,  batch_size=args.batch_size, shuffle=False, num_workers=args.workers, pin_memory=pin_memory)

    # Model
    model = build_model(args.backbone, num_classes=len(CLASS_NAMES))
    total_params = sum(p.numel() for p in model.parameters()) / 1e6
    print(f"[FogGuard] Model: {args.backbone} ({total_params:.1f}M parameters)")

    # Trainer
    trainer = FogGuardTrainer(model, device, lr=args.lr, patience=args.patience)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        trainer.optimizer, T_max=args.epochs, eta_min=1e-6
    )

    # Train
    history = trainer.fit(train_loader, val_loader, args.epochs, args.model_dir, scheduler)
    trainer.evaluate(test_loader)
    trainer.plot_history(save_path=f"{args.model_dir}/training_curve.png")

    # Save history
    with open(f"{args.model_dir}/training_history.json", "w") as f:
        json.dump(history, f, indent=2)
    print(f"✅ History saved: {args.model_dir}/training_history.json")

    # YOLOv8 (optional)
    if not args.skip_yolo:
        try:
            from ultralytics import YOLO
            yolo_data = Path(args.data_dir).parent / "yolo_dataset.yaml"
            if yolo_data.exists():
                print("\n[FogGuard] Training YOLOv8 obstacle detector...")
                yolo = YOLO("yolov8n.pt")
                yolo.train(
                    data=str(yolo_data),
                    epochs=80, imgsz=640, batch=16,
                    name="fogguard_yolo",
                    optimizer="AdamW", lr0=1e-3,
                    augment=True, mosaic=1.0,
                    project=str(args.model_dir)
                )
                print("✅ YOLOv8 training complete!")
            else:
                print(f"⚠ YOLOv8 dataset not found at {yolo_data}. Skipping.")
        except ImportError:
            print("⚠ ultralytics not installed. Skipping YOLOv8. Run: pip install ultralytics")


if __name__ == "__main__":
    main()
