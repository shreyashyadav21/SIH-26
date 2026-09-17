// ============================================================
// NMDC FogGuard – Charts & Real-time Dashboard Data
// ============================================================

const Charts = (() => {
  let visibilityChart = null;
  let productionChart = null;
  let fogDistChart = null;
  let fogGaugeCanvas = null;
  let fogGaugeCtx = null;
  let currentFogAngle = 0;

  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = 'Source Sans 3, sans-serif';

  // ---------- Visibility Timeline Chart ----------
  function initVisibilityChart(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = generateTimeLabels(20);
    const visData = generateVisibilityData(20);
    const fogData = visData.map(v => Math.round(100 - v));

    visibilityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Visibility (m)',
            data: visData,
            borderColor: '#00f2ff',
            backgroundColor: 'rgba(0, 242, 255, 0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#00f2ff',
            yAxisID: 'y'
          },
          {
            label: 'Fog Density (%)',
            data: fogData,
            borderColor: '#ff7b4d',
            backgroundColor: 'rgba(255, 123, 77, 0.06)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#ff7b4d',
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeInOutQuart' },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: '#8ba6c1', font: { size: 11 } } },
          tooltip: {
            backgroundColor: 'rgba(5,10,20,0.92)',
            borderColor: 'rgba(0,212,255,0.25)',
            borderWidth: 1,
            titleColor: '#e8f4fd',
            bodyColor: '#8ba6c1',
            padding: 10
          }
        },
        scales: {
          x: {
            ticks: { color: '#4a6880', font: { size: 10 }, maxTicksLimit: 8 },
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }
          },
          y: {
            position: 'left',
            min: 0, max: 100,
            ticks: { color: '#00f2ff', font: { size: 10 } },
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }
          },
          y2: {
            position: 'right',
            min: 0, max: 100,
            ticks: { color: '#ff7b4d', font: { size: 10 } },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });

    return visibilityChart;
  }

  // ---------- Production Impact Chart ----------
  function initProductionChart(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    productionChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Planned (MT)',
            data: [4200, 4200, 4200, 4200, 4200, 3500, 3500],
            backgroundColor: 'rgba(0, 242, 255, 0.2)',
            borderColor: '#00f2ff',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Actual (MT)',
            data: [3850, 2100, 1600, 3200, 4100, 3400, 3100],
            backgroundColor: (ctx) => {
              const val = ctx.raw;
              if (val < 2000) return 'rgba(255, 77, 77, 0.5)';
              if (val < 3000) return 'rgba(255, 204, 0, 0.5)';
              return 'rgba(0, 255, 157, 0.5)';
            },
            borderColor: (ctx) => {
              const val = ctx.raw;
              if (val < 2000) return '#ff4d4d';
              if (val < 3000) return '#ffcc00';
              return '#00ff9d';
            },
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600 },
        plugins: {
          legend: { labels: { color: '#8ba6c1', font: { size: 11 } } },
          tooltip: {
            backgroundColor: 'rgba(5,10,20,0.92)',
            borderColor: 'rgba(0,212,255,0.25)',
            borderWidth: 1,
            titleColor: '#e8f4fd',
            bodyColor: '#8ba6c1'
          }
        },
        scales: {
          x: { ticks: { color: '#4a6880' }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#4a6880' }, grid: { color: 'rgba(255,255,255,0.04)' } }
        }
      }
    });

    return productionChart;
  }

  // ---------- Fog Distribution Doughnut ----------
  function initFogDistChart(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    fogDistChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Clear', 'Moderate Fog', 'Dense Fog', 'Critical'],
        datasets: [{
          data: [45, 30, 18, 7],
          backgroundColor: [
            'rgba(0, 255, 157, 0.7)',
            'rgba(255, 204, 0, 0.7)',
            'rgba(255, 123, 77, 0.7)',
            'rgba(255, 77, 77, 0.8)'
          ],
          borderColor: ['#00ff9d', '#ffcc00', '#ff7b4d', '#ff4d4d'],
          borderWidth: 2,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#8ba6c1', font: { size: 11 }, padding: 12, usePointStyle: true }
          },
          tooltip: {
            backgroundColor: 'rgba(5,10,20,0.92)',
            borderColor: 'rgba(0,212,255,0.25)',
            borderWidth: 1,
            titleColor: '#e8f4fd',
            bodyColor: '#8ba6c1'
          }
        }
      }
    });

    return fogDistChart;
  }

  // ---------- Fog Gauge (Canvas Arc) ----------
  function initFogGauge(canvasId) {
    fogGaugeCanvas = document.getElementById(canvasId);
    if (!fogGaugeCanvas) return;
    fogGaugeCtx = fogGaugeCanvas.getContext('2d');
    fogGaugeCanvas.width = 200;
    fogGaugeCanvas.height = 200;
    drawFogGauge(65, 'DENSE');
  }

  function drawFogGauge(value, fogClass) {
    if (!fogGaugeCtx) return;
    const ctx = fogGaugeCtx;
    const w = fogGaugeCanvas.width;
    const h = fogGaugeCanvas.height;
    const cx = w / 2, cy = h / 2;
    const r = 80;

    ctx.clearRect(0, 0, w, h);

    const colors = {
      CLEAR: '#00ff9d',
      MODERATE: '#ffcc00',
      DENSE: '#ff7b4d',
      CRITICAL: '#ff4d4d'
    };
    const color = colors[fogClass] || '#ff7b4d';

    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const range = endAngle - startAngle;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value arc
    const targetAngle = startAngle + (value / 100) * range;
    const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    grad.addColorStop(0, color + '88');
    grad.addColorStop(1, color);
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, targetAngle);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Glow effect
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, targetAngle);
    ctx.strokeStyle = color + '22';
    ctx.lineWidth = 28;
    ctx.stroke();

    // Tick marks
    for (let i = 0; i <= 10; i++) {
      const angle = startAngle + (i / 10) * range;
      const isMajor = i % 5 === 0;
      const innerR = isMajor ? r - 22 : r - 16;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * (r - 8), cy + Math.sin(angle) * (r - 8));
      ctx.strokeStyle = isMajor ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();
    }

    // Center value
    ctx.fillStyle = color;
    ctx.font = `bold 32px Orbitron, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, cx, cy - 8);

    ctx.fillStyle = '#4a6880';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('FOG SCORE', cx, cy + 20);

    ctx.textBaseline = 'alphabetic';
  }

  // ---------- Realtime Update ----------
  function updateVisibilityChart(visibility, fogScore) {
    if (!visibilityChart) return;
    const now = new Date();
    const label = `${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;

    visibilityChart.data.labels.push(label);
    visibilityChart.data.datasets[0].data.push(visibility);
    visibilityChart.data.datasets[1].data.push(fogScore);

    if (visibilityChart.data.labels.length > 30) {
      visibilityChart.data.labels.shift();
      visibilityChart.data.datasets.forEach(d => d.data.shift());
    }
    visibilityChart.update();
  }

  // ---------- Helpers ----------
  function generateTimeLabels(n) {
    const labels = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const t = new Date(now - i * 60000);
      labels.push(`${t.getHours()}:${t.getMinutes().toString().padStart(2,'0')}`);
    }
    return labels;
  }

  function generateVisibilityData(n) {
    let val = 30;
    return Array.from({ length: n }, () => {
      val = Math.max(3, Math.min(100, val + (Math.random() - 0.5) * 20));
      return Math.round(val);
    });
  }

  return {
    initVisibilityChart,
    initProductionChart,
    initFogDistChart,
    initFogGauge,
    drawFogGauge,
    updateVisibilityChart
  };
})();

window.Charts = Charts;
