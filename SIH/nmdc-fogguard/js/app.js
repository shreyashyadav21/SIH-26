// ============================================================
// NMDC FogGuard – Core App Logic
// ============================================================

const App = (() => {
  let currentFogLevel = 'DENSE';
  let currentVisibility = 8;
  let currentFogScore = 72;
  let simInterval = null;
  let isSimRunning = true;
  let alertLog = [];
  const MAX_ALERTS = 20;

  const FOG_LEVELS = ['CLEAR', 'MODERATE', 'DENSE', 'CRITICAL'];
  const FOG_COLORS = {
    CLEAR: '#00ff9d', MODERATE: '#ffcc00', DENSE: '#ff7b4d', CRITICAL: '#ff4d4d'
  };

  // ---------- Alert System ----------
  function addAlert(type, title, desc) {
    const alert = {
      id: Date.now(),
      type,
      title,
      desc,
      time: new Date().toLocaleTimeString()
    };
    alertLog.unshift(alert);
    if (alertLog.length > MAX_ALERTS) alertLog.pop();
    renderAlerts();

    if (window.VoiceAlerts) {
      const voiceMap = { dense: 'DENSE', critical: 'CRITICAL', moderate: 'MODERATE', info: null };
      if (voiceMap[type]) VoiceAlerts.alert(voiceMap[type]);
    }
    return alert;
  }

  function renderAlerts() {
    const panel = document.getElementById('alertPanel');
    if (!panel) return;

    panel.innerHTML = alertLog.slice(0, 8).map(a => `
      <div class="alert-item alert-${a.type}">
        <div class="alert-icon">${getAlertIcon(a.type)}</div>
        <div class="alert-content">
          <div class="alert-title">${a.title}</div>
          <div class="alert-desc">${a.desc}</div>
        </div>
        <div class="alert-time">${a.time}</div>
      </div>
    `).join('');
  }

  function getAlertIcon(type) {
    const icons = { dense: '🌫️', critical: '🚨', moderate: '⚠️', info: 'ℹ️', success: '✅' };
    return icons[type] || 'ℹ️';
  }

  // ---------- KPI Updater ----------
  function updateKPIs(fogScore, visibility, fogClass) {
    const setEl = (id, val, color) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = val;
      if (color) el.style.color = color;
    };

    const color = FOG_COLORS[fogClass];

    setEl('kpiFogScore', fogScore, color);
    setEl('kpiVisibility', visibility + 'm', color);
    setEl('kpiFogClass', fogClass, color);

    // Gauge
    if (window.Charts) Charts.drawFogGauge(fogScore, fogClass);

    // Gauge label
    const labelEl = document.getElementById('fogGaugeLabel');
    if (labelEl) {
      labelEl.textContent = fogClass;
      labelEl.className = `fog-gauge-label ${fogClass.toLowerCase()}`;
    }

    // Gauge value
    const valEl = document.getElementById('fogGaugeValue');
    if (valEl) { valEl.textContent = fogScore; valEl.style.color = color; }

    // Visibility bar
    const visBar = document.getElementById('visibilityBar');
    if (visBar) {
      const pct = Math.min(100, visibility);
      visBar.style.width = pct + '%';
      visBar.style.background = `linear-gradient(90deg, ${color}, ${color}66)`;
    }
  }

  // ---------- Simulation ----------
  function runSimulation() {
    if (simInterval) clearInterval(simInterval);

    simInterval = setInterval(() => {
      // Slowly evolve fog level
      const drift = (Math.random() - 0.5) * 12;
      currentFogScore = Math.max(0, Math.min(100, currentFogScore + drift));

      if (currentFogScore >= 75) {
        currentFogLevel = 'CRITICAL';
        currentVisibility = Math.round(1 + Math.random() * 4);
      } else if (currentFogScore >= 55) {
        currentFogLevel = 'DENSE';
        currentVisibility = Math.round(5 + Math.random() * 15);
      } else if (currentFogScore >= 30) {
        currentFogLevel = 'MODERATE';
        currentVisibility = Math.round(20 + Math.random() * 40);
      } else {
        currentFogLevel = 'CLEAR';
        currentVisibility = Math.round(60 + Math.random() * 40);
      }

      updateKPIs(Math.round(currentFogScore), currentVisibility, currentFogLevel);

      if (window.Charts) Charts.updateVisibilityChart(currentVisibility, Math.round(currentFogScore));

      if (window.FleetTracker) FleetTracker.updateFleet(currentFogLevel);

      // Update time display
      const timeEl = document.getElementById('currentTime');
      if (timeEl) timeEl.textContent = new Date().toLocaleTimeString();

      // Periodic alerts
      if (Math.random() < 0.15) {
        generateRandomAlert();
      }

    }, 3000);
  }

  function generateRandomAlert() {
    const alertTypes = [
      { type: 'dense', title: 'Dense Fog Detected – Haul Road C', desc: 'Visibility < 8m on summit road. DMP-07 reducing speed.' },
      { type: 'moderate', title: 'Fog Intensifying – Sector B', desc: 'Visibility dropped to 25m. Advisory: 20 km/h limit active.' },
      { type: 'info', title: 'V2V Alert – DMP-03 & DMP-08', desc: 'Inter-vehicle distance: 42m. Maintain 50m separation.' },
      { type: 'info', title: 'Weather Update', desc: 'Wind speed: 12 km/h NE. Humidity: 94%. Fog expected to persist.' },
      { type: 'critical', title: 'CRITICAL FOG – Haul Road A Summit', desc: 'Visibility < 3m. All vehicles halted. Control room notified.' },
      { type: 'success', title: 'Fog Clearing – Sector D', desc: 'Visibility improved to 60m. Operations resuming normal speed.' }
    ];
    const a = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    addAlert(a.type, a.title, a.desc);
  }

  // ---------- Manual Fog Level Control ----------
  function setFogLevel(level) {
    currentFogLevel = level;
    if (level === 'CRITICAL') { currentFogScore = 85; currentVisibility = 2; }
    else if (level === 'DENSE') { currentFogScore = 68; currentVisibility = 8; }
    else if (level === 'MODERATE') { currentFogScore = 45; currentVisibility = 30; }
    else { currentFogScore = 15; currentVisibility = 80; }

    updateKPIs(currentFogScore, currentVisibility, currentFogLevel);
    if (window.VoiceAlerts && level !== 'CLEAR') VoiceAlerts.alert(level);
    addAlert(
      level.toLowerCase(),
      `Fog Level Set: ${level}`,
      `Manual control: Visibility set to ${currentVisibility}m. Fleet advisory updated.`
    );
  }

  // ---------- Page Init ----------
  function initDashboard() {
    // Charts
    if (window.Charts) {
      Charts.initVisibilityChart('visibilityChart');
      Charts.initProductionChart('productionChart');
      Charts.initFogDistChart('fogDistChart');
      Charts.initFogGauge('fogGaugeCanvas');
    }

    // Voice
    if (window.initVoicePanel) initVoicePanel();

    // Fleet
    if (window.FleetTracker) {
    if (document.getElementById('dashboardMap')) {
      FleetTracker.initMap('dashboardMap');
    }
      FleetTracker.initFleet();
      FleetTracker.setAlertCallback((v1, v2, dist) => {
        addAlert('dense', `V2V Proximity – ${v1} & ${v2}`, `Distance: ${dist}m. Collision risk. Reduce speed.`);
        if (window.VoiceAlerts) VoiceAlerts.vehicleAlert(v1, dist, currentFogLevel);
      });
    }

    // Initial KPI
    updateKPIs(currentFogScore, currentVisibility, currentFogLevel);
    addAlert('dense', 'System Online – FogGuard Active', 'All sensors operational. Monitoring 10 dump trucks on haul roads.');
    addAlert('moderate', 'Monsoon Advisory Active', 'June–October fog monitoring protocol engaged. Bailadila Sector.');

    // Start simulation
    runSimulation();

    // Fog level control buttons
    document.querySelectorAll('[data-fog-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-fog-level]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setFogLevel(btn.dataset.fogLevel);
      });
    });
  }

  // ---------- Scroll Reveal ----------
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 100);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // ---------- Active Nav ----------
  function setActiveNav() {
    const path = location.pathname;
    document.querySelectorAll('.navbar-nav a').forEach(a => {
      if (a.href.includes(path.split('/').pop())) a.classList.add('active');
    });
  }

  return {
    initDashboard,
    initScrollReveal,
    setActiveNav,
    addAlert,
    setFogLevel,
    getFogLevel: () => currentFogLevel,
    getVisibility: () => currentVisibility
  };
})();

// Init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  App.setActiveNav();
  App.initScrollReveal();
  if (document.getElementById('dashboardMap') || document.getElementById('visibilityChart')) {
    App.initDashboard();
  }
});

window.App = App;
