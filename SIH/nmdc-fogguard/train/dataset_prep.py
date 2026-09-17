"""
NMDC FogGuard – Dataset Preparation Script
==========================================
Downloads and prepares open-source fog datasets for training.
Datasets: RESIDE (dehazing) + FRIDA2 (foggy roads)

Usage:
    python dataset_prep.py --source-dir ./data/raw --output-dir ./data/processed
"""

import os, sys, json, shutil, zipfile, argparse
from pathlib import Path
import numpy as np
import cv2
from tqdm import tqdm

# ── Config ──────────────────────────────────────────────────────────────
CLASS_NAMES = ["CLEAR", "MODERATE", "DENSE", "CRITICAL"]
IMG_SIZE = (224, 224)

FOG_BETA_MAP = {
    "CLEAR":    (0.0, 0.3),
    "MODERATE": (0.5, 1.0),
    "DENSE":    (1.2, 1.8),
    "CRITICAL": (2.0, 3.0),
}

# Open-source dataset links (for reference – download manually if needed)
DATASET_INFO = {
    "RESIDE": {
        "url": "https://sites.google.com/view/reside-dehaze-datasets",
        "desc": "REalistic Single Image DEhazing - 13,990 indoor/outdoor hazy images",
        "paper": "Li et al., CVPR 2018",
        "license": "CC BY 4.0",
    },
    "FRIDA2": {
        "url": "http://perso.lcpc.fr/tarel.jean-philippe/bdd/frida2.html",
        "desc": "Foggy Road Image Dataset - 330 synthetic foggy road scenes",
        "paper": "Tarel & Hautiere, ICCV 2009",
        "license": "Free for research",
    },
}


def print_dataset_info():
    print("\n" + "="*60)
    print("  NMDC FogGuard – Open Source Training Datasets")
    print("="*60)
    for name, info in DATASET_INFO.items():
        print(f"\n📦 {name}")
        print(f"   URL:     {info['url']}")
        print(f"   Desc:    {info['desc']}")
        print(f"   Paper:   {info['paper']}")
        print(f"   License: {info['license']}")
    print("\n" + "="*60)
    print("  Download datasets manually and place in ./data/raw/")
    print("="*60 + "\n")


# ── Fog Estimation (Dark Channel Prior) ─────────────────────────────────
def dark_channel_prior(img, patch_size=15):
    """Estimate dark channel for dehazing."""
    min_ch = np.min(img, axis=2)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (patch_size, patch_size))
    return cv2.erode(min_ch, kernel)


def estimate_fog_score(img_bgr):
    """
    Estimate fog density score [0, 1] from image.
    Higher score = more fog.
    """
    img_f = img_bgr.astype(np.float32) / 255.0

    # Component 1: Brightness (high brightness = fog)
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    brightness = np.mean(gray) / 255.0

    # Component 2: Low contrast = fog
    contrast = np.std(gray) / 128.0

    # Component 3: Dark channel prior (high value = hazy/foggy)
    dc = dark_channel_prior(img_f)
    dc_mean = np.mean(dc)

    # Component 4: Color saturation (low saturation = fog)
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    saturation = np.mean(hsv[:, :, 1]) / 255.0

    # Fog score (weighted combination)
    fog_score = (
        brightness      * 0.35 +
        (1 - contrast)  * 0.30 +
        dc_mean         * 0.25 +
        (1 - saturation)* 0.10
    )
    return float(np.clip(fog_score, 0.0, 1.0))


def score_to_class(score):
    """Map fog score [0,1] to class name."""
    if score >= 0.75: return "CRITICAL"
    if score >= 0.50: return "DENSE"
    if score >= 0.25: return "MODERATE"
    return "CLEAR"


# ── Fog Synthesis (Koschmieder's Law) ───────────────────────────────────
def synthesize_fog(img_bgr, beta=1.0, A=0.90, depth_seed=None):
    """
    Synthesize fog using Koschmieder's atmospheric scattering model.
    I(x) = J(x) * t(x) + A * (1 - t(x))
    where t(x) = exp(-beta * d(x)) is the transmission map.

    Args:
        img_bgr: Input image (BGR, uint8)
        beta: Scattering coefficient (0.5=light, 2.0=dense)
        A: Atmospheric light [0,1]
        depth_seed: Random seed for depth map
    """
    h, w = img_bgr.shape[:2]

    if depth_seed is not None:
        rng = np.random.default_rng(depth_seed)
    else:
        rng = np.random.default_rng()

    # Generate depth map (simulate distance from camera)
    # Rows further down = closer; rows near top = sky/distant
    y_coords = np.linspace(0.5, 2.0, h)
    depth = np.outer(y_coords, np.ones(w)).astype(np.float32)
    # Add noise for realism
    noise = rng.uniform(0.8, 1.2, (h, w)).astype(np.float32)
    depth = depth * noise

    # Transmission map
    t = np.exp(-beta * depth)[..., np.newaxis]  # shape: (H, W, 1)

    img_f = img_bgr.astype(np.float32) / 255.0
    foggy = img_f * t + A * (1.0 - t)
    foggy = np.clip(foggy * 255, 0, 255).astype(np.uint8)
    return foggy


# ── Mine Environment Augmentation ────────────────────────────────────────
def mine_augment(img_bgr):
    """Apply mine-specific color grading to simulate Bailadila terrain."""
    # Slightly warm the image (iron ore reddish-brown terrain)
    img_f = img_bgr.astype(np.float32)
    img_f[:, :, 2] = np.clip(img_f[:, :, 2] * 1.05, 0, 255)  # boost red
    img_f[:, :, 0] = np.clip(img_f[:, :, 0] * 0.95, 0, 255)  # reduce blue

    # Random dust haze (brownish tint)
    if np.random.random() < 0.3:
        dust = np.random.uniform(0.02, 0.08)
        dust_color = np.array([40, 60, 120], dtype=np.float32) * dust
        img_f = np.clip(img_f + dust_color, 0, 255)

    return img_f.astype(np.uint8)


# ── Dataset Creator ───────────────────────────────────────────────────────
def create_synthetic_dataset(output_dir, n_per_class=500, img_size=224):
    """
    Create synthetic fog dataset when no real dataset is available.
    Uses noise-based base images with fog synthesis.
    """
    output_dir = Path(output_dir)
    print(f"\n[FogGuard] Creating synthetic dataset ({n_per_class} images/class)...")

    rng = np.random.default_rng(42)

    for cls_name in CLASS_NAMES:
        cls_dir = output_dir / cls_name
        cls_dir.mkdir(parents=True, exist_ok=True)

        beta_min, beta_max = FOG_BETA_MAP[cls_name]

        for i in tqdm(range(n_per_class), desc=f"  {cls_name}"):
            # Generate a base "road/terrain" image
            base = generate_synthetic_road_image(img_size, rng)
            base = mine_augment(base)

            # Apply fog
            beta = rng.uniform(beta_min, beta_max) if beta_max > beta_min else beta_min
            if beta > 0:
                foggy = synthesize_fog(base, beta=beta, depth_seed=int(rng.integers(0, 10000)))
            else:
                foggy = base

            out_path = cls_dir / f"synthetic_{cls_name.lower()}_{i:05d}.jpg"
            cv2.imwrite(str(out_path), foggy, [cv2.IMWRITE_JPEG_QUALITY, 90])

    print(f"✅ Synthetic dataset created at: {output_dir}")
    return output_dir


def generate_synthetic_road_image(img_size, rng):
    """Generate a synthetic mine haul road image."""
    h = w = img_size
    img = np.zeros((h, w, 3), dtype=np.uint8)

    # Sky (upper 40%)
    sky_h = int(h * 0.4)
    sky_base = rng.integers(120, 180)
    for y in range(sky_h):
        brightness = int(sky_base + (y / sky_h) * 20)
        img[y, :] = [brightness, int(brightness * 0.95), int(brightness * 0.9)]

    # Terrain / road (lower 60%)
    for y in range(sky_h, h):
        # Road in center
        road_w = int(w * 0.5)
        road_x1 = (w - road_w) // 2
        road_x2 = road_x1 + road_w

        # Terrain color (iron ore brownish-grey)
        terrain_c = rng.integers(80, 140)
        img[y, :] = [terrain_c, int(terrain_c * 0.85), int(terrain_c * 0.75)]

        # Road color (darker grey)
        road_c = rng.integers(60, 110)
        img[y, road_x1:road_x2] = [road_c, road_c, road_c]

    # Add some noise for texture
    noise = rng.integers(-15, 15, img.shape).astype(np.int16)
    img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    # Blur for realism
    img = cv2.GaussianBlur(img, (3, 3), 0)
    return img


# ── Prepare Real Dataset ──────────────────────────────────────────────────
def prepare_real_dataset(source_dir, output_dir, img_size=224, augment_per_image=4):
    """
    Process real images from RESIDE/FRIDA2.
    Classifies by fog score and augments with synthetic fog.
    """
    source_dir = Path(source_dir)
    output_dir = Path(output_dir)

    # Create class directories
    for cls in CLASS_NAMES:
        (output_dir / cls).mkdir(parents=True, exist_ok=True)

    # Find all images
    img_paths = (
        list(source_dir.rglob("*.jpg")) +
        list(source_dir.rglob("*.jpeg")) +
        list(source_dir.rglob("*.png"))
    )
    print(f"[FogGuard] Found {len(img_paths)} images in {source_dir}")

    classified = {c: 0 for c in CLASS_NAMES}
    rng = np.random.default_rng(42)

    for p in tqdm(img_paths, desc="Processing images"):
        img = cv2.imread(str(p))
        if img is None:
            continue

        img = cv2.resize(img, (img_size, img_size))

        # Classify original image
        score = estimate_fog_score(img)
        cls   = score_to_class(score)

        # Save original
        out_name = f"{p.stem}_orig{p.suffix}"
        cv2.imwrite(str(output_dir / cls / out_name), img)
        classified[cls] += 1

        # Augment with synthetic fog variations
        for aug_i in range(augment_per_image):
            beta_min, beta_max = FOG_BETA_MAP[cls]
            # Vary beta slightly
            beta_offset = rng.uniform(-0.2, 0.2)
            beta = float(np.clip(rng.uniform(beta_min, beta_max) + beta_offset, 0.1, 3.5))

            if beta > 0.1:
                aug_img = synthesize_fog(img, beta=beta)
            else:
                aug_img = mine_augment(img)

            aug_score = estimate_fog_score(aug_img)
            aug_cls   = score_to_class(aug_score)

            aug_name = f"{p.stem}_aug{aug_i}{p.suffix}"
            cv2.imwrite(str(output_dir / aug_cls / aug_name), aug_img)
            classified[aug_cls] += 1

    print("\n📊 Dataset class distribution:")
    for cls, count in classified.items():
        print(f"   {cls:10s}: {count:6d} images")

    total = sum(classified.values())
    print(f"   {'TOTAL':10s}: {total:6d} images")
    return classified


# ── YOLO Dataset Creator ──────────────────────────────────────────────────
def create_yolo_dataset(source_dir, output_dir):
    """Create YOLO format dataset for obstacle detection."""
    output_dir = Path(output_dir)
    (output_dir / "images" / "train").mkdir(parents=True, exist_ok=True)
    (output_dir / "images" / "val").mkdir(parents=True, exist_ok=True)
    (output_dir / "labels" / "train").mkdir(parents=True, exist_ok=True)
    (output_dir / "labels" / "val").mkdir(parents=True, exist_ok=True)

    # Create dataset.yaml
    yaml_content = f"""
path: {output_dir.absolute()}
train: images/train
val: images/val

nc: 3
names:
  0: dump_truck
  1: person
  2: obstacle

# NMDC FogGuard – YOLOv8 Obstacle Detection Dataset
# For detecting vehicles and obstacles in foggy mine haul roads
"""
    yaml_path = output_dir / "yolo_dataset.yaml"
    yaml_path.write_text(yaml_content)
    print(f"✅ YOLO dataset config saved: {yaml_path}")
    return yaml_path


# ── Main ───────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="NMDC FogGuard Dataset Preparation")
    parser.add_argument("--source-dir",  default="./data/raw",       help="Raw dataset directory")
    parser.add_argument("--output-dir",  default="./data/processed",  help="Processed output directory")
    parser.add_argument("--img-size",    type=int, default=224)
    parser.add_argument("--synthetic",   action="store_true", help="Create synthetic dataset (no real data needed)")
    parser.add_argument("--n-per-class", type=int, default=1500, help="Synthetic images per class")
    parser.add_argument("--augment-per-image", type=int, default=6, help="Synthetic variants per real image")
    parser.add_argument("--info",        action="store_true", help="Print dataset download info")
    args = parser.parse_args()

    if args.info:
        print_dataset_info()
        return

    print("\n🏭 NMDC FogGuard – Dataset Preparation")
    print("="*50)

    if args.synthetic:
        # Synthetic mode (no real dataset needed)
        create_synthetic_dataset(
            args.output_dir,
            n_per_class=args.n_per_class,
            img_size=args.img_size
        )
    else:
        # Real dataset mode
        source = Path(args.source_dir)
        if not source.exists():
            print(f"\n❌ Source directory not found: {source}")
            print("   Run with --info to see dataset download links.")
            print("   Or use --synthetic to generate without real data.\n")
            sys.exit(1)

        prepare_real_dataset(
            source_dir=args.source_dir,
            output_dir=args.output_dir,
            img_size=args.img_size,
            augment_per_image=args.augment_per_image,
        )

    # Create YOLO dataset structure
    yolo_dir = Path(args.output_dir).parent / "yolo"
    create_yolo_dataset(args.output_dir, yolo_dir)

    print("\n✅ Dataset preparation complete!")
    print(f"   Processed data: {args.output_dir}")
    print("   Next step: python train_fog_model.py --epochs 100")


if __name__ == "__main__":
    main()
