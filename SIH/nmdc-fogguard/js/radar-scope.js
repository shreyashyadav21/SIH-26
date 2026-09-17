// ============================================================
// MineSafe FogGuard – 360° Tactical Radar Scope Display
// Renders concentric range rings, rotating sweep beam,
// Center Main Object (Our Mining Dumper Truck DT-104),
// and detected surrounding objects with threat vectors.
// ============================================================

class RadarScope {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.maxRange = options.maxRange || 100; // meters
    this.sweepAngle = 0; // radians
    this.sweepSpeed = options.sweepSpeed || 0.035;
    this.obstacles = [];
    this.audioPing = options.audioPing || false;
    this.lastPingTime = 0;
    this.isRunning = true;
    this.mainVehicle = {
      id: 'DT-104',
      label: 'MAIN VEHICLE (YOU)',
      type: 'HAUL TRUCK 240T',
      speed: '18 km/h',
      heading: '0° N'
    };

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setObstacles(obsList) {
    this.obstacles = obsList || [];
  }

  setRange(meters) {
    this.maxRange = meters;
  }

  toggleAudioPing() {
    this.audioPing = !this.audioPing;
    return this.audioPing;
  }

  playRadarPing(freq = 900) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  animate() {
    if (!this.isRunning || !this.canvas) return;
    this.sweepAngle = (this.sweepAngle + this.sweepSpeed) % (Math.PI * 2);
    this.render();
    requestAnimationFrame(this.animate);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 20;

    ctx.clearRect(0, 0, w, h);

    // 1. Dark radar background
    const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
    bgGrad.addColorStop(0, '#04161c');
    bgGrad.addColorStop(0.65, '#020b12');
    bgGrad.addColorStop(1, '#01060a');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 2. Concentric Range Rings
    const ringSteps = [15, 35, 60, this.maxRange];
    ringSteps.forEach(dist => {
      const ringR = (dist / this.maxRange) * r;
      if (ringR > r) return;

      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.lineWidth = dist === 15 ? 1.5 : 1;
      ctx.strokeStyle = dist === 15 
        ? 'rgba(255, 59, 59, 0.45)' 
        : (dist === 35 ? 'rgba(255, 215, 64, 0.35)' : 'rgba(0, 242, 255, 0.2)');
      
      if (dist === 15) ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Range text
      ctx.font = '10px "Barlow Semi Condensed", monospace';
      ctx.fillStyle = dist === 15 ? '#ff4d4d' : (dist === 35 ? '#ffd740' : 'rgba(0, 242, 255, 0.7)');
      ctx.fillText(`${dist}m`, cx + 4, cy - ringR + 12);
    });

    // 3. Radial Crosshairs & Degree Ticks
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.15)';
    ctx.lineWidth = 1;

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
    ctx.stroke();

    // 45 degree diagonals
    ctx.beginPath();
    const diag = r * 0.7071;
    ctx.moveTo(cx - diag, cy - diag); ctx.lineTo(cx + diag, cy + diag);
    ctx.moveTo(cx - diag, cy + diag); ctx.lineTo(cx + diag, cy - diag);
    ctx.stroke();

    // Compass Headings
    ctx.font = '11px "Barlow Semi Condensed", sans-serif';
    ctx.fillStyle = '#00f2ff';
    ctx.textAlign = 'center';
    ctx.fillText('0° FWD', cx, cy - r + 14);
    ctx.fillText('180° AFT', cx, cy + r - 6);
    ctx.textAlign = 'right';
    ctx.fillText('-90° PORT', cx - r + 55, cy - 4);
    ctx.textAlign = 'left';
    ctx.fillText('+90° STBD', cx + r - 55, cy - 4);

    // 4. Rotating Radar Sweep Beam (Trailing phosphor glow)
    const sweepSegments = 40;
    for (let i = 0; i < sweepSegments; i++) {
      const segAngle = this.sweepAngle - (i * 0.015);
      const alpha = (1 - i / sweepSegments) * 0.25;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, segAngle, segAngle + 0.015);
      ctx.closePath();
      ctx.fillStyle = `rgba(0, 242, 255, ${alpha})`;
      ctx.fill();
    }

    // Leading sweep line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(this.sweepAngle) * r, cy + Math.sin(this.sweepAngle) * r);
    ctx.strokeStyle = 'rgba(0, 255, 157, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Surrounding Detected Objects
    this.obstacles.forEach((obj, idx) => {
      // Calculate polar coordinates relative to center vehicle
      // Normalize distance
      const dist = Math.min(this.maxRange, Math.max(2, obj.distance || 25));
      const distR = (dist / this.maxRange) * r;

      // Bearing angle based on screen X offset (0 = straight ahead, -45 deg left, +45 deg right)
      // Screen width usually 640px, middle is 320px
      let bearing = -Math.PI / 2; // default forward (up)
      if (typeof obj.x === 'number') {
        const normX = ((obj.x + (obj.width || 0) / 2) / 640) - 0.5; // -0.5 to +0.5
        bearing = -Math.PI / 2 + (normX * Math.PI * 0.7); // spread forward ±63°
      } else {
        // distribute artificially around front quadrant if no x coord
        const angleSpread = [-0.35, 0.25, -0.6, 0.5, 0.0];
        bearing = -Math.PI / 2 + (angleSpread[idx % angleSpread.length]);
      }

      const objX = cx + Math.cos(bearing) * distR;
      const objY = cy + Math.sin(bearing) * distR;

      const isCritical = dist < 15;
      const isWarning = dist >= 15 && dist < 35;
      const color = isCritical ? '#ff3b3b' : (isWarning ? '#ffd740' : '#00e676');

      // Threat vector line to center vehicle
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(objX, objY);
      ctx.strokeStyle = isCritical ? 'rgba(255, 59, 59, 0.5)' : (isWarning ? 'rgba(255, 215, 64, 0.25)' : 'rgba(0, 230, 118, 0.15)');
      ctx.lineWidth = isCritical ? 2 : 1;
      if (isCritical) ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Blip Outer Glow
      const pulseSize = (Date.now() % 1000) / 1000;
      ctx.beginPath();
      ctx.arc(objX, objY, 7 + pulseSize * 6, 0, Math.PI * 2);
      ctx.fillStyle = isCritical ? `rgba(255, 59, 59, ${0.6 - pulseSize * 0.4})` : `rgba(0, 242, 255, 0.2)`;
      ctx.fill();

      // Blip Core
      ctx.beginPath();
      ctx.arc(objX, objY, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Target Label & Distance Tag
      ctx.font = 'bold 10px "Barlow Semi Condensed", sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText(`${obj.label || 'OBJECT'}`, objX + 8, objY - 3);
      ctx.fillStyle = color;
      ctx.fillText(`${dist}m`, objX + 8, objY + 9);

      // Audio ping for critical targets as sweep passes them
      const angleDiff = Math.abs(this.sweepAngle - (bearing < 0 ? bearing + Math.PI * 2 : bearing));
      if (angleDiff < 0.05 && this.audioPing && Date.now() - this.lastPingTime > 600) {
        this.lastPingTime = Date.now();
        this.playRadarPing(isCritical ? 1200 : (isWarning ? 850 : 600));
      }
    });

    // 6. MAIN OBJECT (CENTER VEHICLE - DUMPER DT-104)
    // Safe buffer perimeter
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 242, 255, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#00f2ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Directional orientation triangle (facing 0° North)
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx - 7, cy + 8);
    ctx.lineTo(cx, cy + 5);
    ctx.lineTo(cx + 7, cy + 8);
    ctx.closePath();
    ctx.fillStyle = '#00f2ff';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center Main Vehicle Label
    ctx.font = 'bold 11px "Barlow Semi Condensed", sans-serif';
    ctx.fillStyle = '#00f2ff';
    ctx.textAlign = 'center';
    ctx.fillText('DT-104 [YOU]', cx, cy + 26);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('(0m, 0m)', cx, cy + 37);

    // 7. Tactical Radar Status Overlay (HUD Corners)
    ctx.textAlign = 'left';
    ctx.font = '10px monospace';
    ctx.fillStyle = '#00f2ff';
    ctx.fillText(`RANGE: ${this.maxRange}m`, 14, 18);
    ctx.fillText(`TARGETS: ${this.obstacles.length}`, 14, 30);

    ctx.textAlign = 'right';
    const closestDist = this.obstacles.length 
      ? Math.min(...this.obstacles.map(o => o.distance || 99))
      : 0;
    const threatLevel = closestDist > 0 && closestDist < 15 ? 'CRITICAL' : (closestDist < 35 && closestDist > 0 ? 'WARNING' : 'CLEAR');
    ctx.fillStyle = threatLevel === 'CRITICAL' ? '#ff3b3b' : (threatLevel === 'WARNING' ? '#ffd740' : '#00e676');
    ctx.fillText(`SECTOR: ${threatLevel}`, w - 14, 18);
    ctx.fillText(closestDist > 0 ? `CLOSEST: ${closestDist}m` : 'PATH CLEAR', w - 14, 30);
  }
}

window.RadarScope = RadarScope;
