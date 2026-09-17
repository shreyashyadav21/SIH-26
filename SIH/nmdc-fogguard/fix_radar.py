import os

html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Radar | NMDC FogGuard</title>
  <link rel="stylesheet" href="css/base.css" />
  <link rel="stylesheet" href="css/dashboard.css" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    .radar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .radar-panel { background: #0a111a; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; }
    .radar-item { 
      display: flex; justify-content: space-between; align-items: center; 
      background: #111827; padding: 15px; border-radius: 8px; 
      border-left: 5px solid #00e676; margin-bottom: 10px;
    }
    .radar-item.critical { border-left-color: #ff3b3b; }
    .radar-item.warning { border-left-color: #ffd740; }
    .log-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .log-table th, .log-table td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #1f2937; font-size: 0.9rem; }
    .log-table th { color: #9ca3af; font-size: 0.8rem; letter-spacing: 1px; }
    .alert-box { background: rgba(255, 59, 59, 0.1); border: 1px solid #ff3b3b; color: #ff3b3b; padding: 12px; border-radius: 6px; margin-bottom: 10px; font-weight: bold; }
    .alert-box.warn { background: rgba(255, 215, 64, 0.1); border-color: #ffd740; color: #ffd740; }
  </style>
</head>
<body>

<div class="app-container">
  <div class="sidebar">
    <div class="brand">
      <div class="logo"></div>
      <div class="brand-text">NMDC FOGGUARD</div>
    </div>
    <ul class="navbar-nav">
      <li><a href="index.html">Home</a></li>
      <li><a href="dashboard.html">Environment</a></li>
      <li><a href="video-analysis.html">Video AI</a></li>
      <li><a href="radar.html" class="active">Radar</a></li>
      <li><a href="training.html">Model Training</a></li>
    </ul>
  </div>

  <div class="main-content">
    <header class="top-header" style="justify-content:space-between">
      <h1 class="page-title">RADAR COMMAND CENTER</h1>
      <div style="color:var(--safe-color); font-weight:bold; letter-spacing:2px; font-size:1.1rem;">
        ? RECORDING SENSOR DATA
      </div>
    </header>

    <main class="dashboard-main" style="padding: 20px 30px;">
      
      <div class="radar-grid">
        <!-- LEFT COLUMN -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <div class="radar-panel" style="background: linear-gradient(145deg, #111827, #0a111a); border-left: 4px solid #00d4ff;">
            <h3 style="color:#00d4ff; margin-bottom:10px; font-size:1.2rem; letter-spacing:1px;">AI WEATHER PREDICTION</h3>
            <div id="weatherBox" style="font-size: 1.5rem; font-weight: bold; color: #fff;">
              Analyzing Atmosphere...
            </div>
          </div>

          <div class="radar-panel">
            <h3 style="color:#00e676; margin-bottom:15px; font-size:1.2rem; letter-spacing:1px;">LIVE DETECTIONS</h3>
            <div id="liveRadarList">
              <div style="color:#666; font-style:italic;">Waiting for AI Video Feed...</div>
            </div>
          </div>

          <div class="radar-panel">
            <h3 style="color:#ff3b3b; margin-bottom:15px; font-size:1.2rem; letter-spacing:1px;">ACTIVE PROXIMITY ALERTS</h3>
            <div id="alertBoxList">
              <div style="color:#666; font-style:italic;">No active alerts. Path is safe.</div>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <div class="radar-panel">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
              <h3 style="color:#00d4ff; font-size:1.2rem; letter-spacing:1px;">DETECTION ANALYTICS</h3>
              <button onclick="clearHistory()" style="background:#1f2937; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Clear Data</button>
            </div>
            <canvas id="radarChart" height="120"></canvas>
          </div>

          <div class="radar-panel" style="flex: 1; overflow-y: auto; max-height: 400px;">
            <h3 style="color:#fff; margin-bottom:15px; font-size:1.2rem; letter-spacing:1px;">PERSISTENT DETECTION LOG</h3>
            <table class="log-table">
              <thead><tr><th>TIMESTAMP</th><th>DETECTED OBJECT</th><th>DISTANCE</th><th>THREAT LEVEL</th></tr></thead>
              <tbody id="historyTableBody"></tbody>
            </table>
          </div>

        </div>
      </div>

    </main>
  </div>
</div>

<script>
  let radarChart;
  
  function getHistory() {
    return JSON.parse(localStorage.getItem("radarHistory") || "[]");
  }

  function initChart() {
    const historyData = getHistory();
    const ctx = document.getElementById("radarChart").getContext("2d");
    radarChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: historyData.map(d => d.time),
        datasets: [{
          label: "Closest Object Distance (m)",
          data: historyData.map(d => d.distance),
          borderColor: "#00d4ff",
          backgroundColor: "rgba(0, 212, 255, 0.1)",
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        animation: false,
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: "#1f2937" } },
          x: { display: false }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  function updateChart() {
    if(!radarChart) return;
    const historyData = getHistory();
    const recentData = historyData.slice(-20);
    radarChart.data.labels = recentData.map(d => d.time);
    radarChart.data.datasets[0].data = recentData.map(d => d.distance);
    radarChart.update();
  }

  function renderHistoryTable() {
    const historyData = getHistory();
    const tbody = document.getElementById("historyTableBody");
    tbody.innerHTML = [...historyData].reverse().map(log => {
      let color = log.distance < 15 ? "#ff3b3b" : (log.distance < 35 ? "#ffd740" : "#00e676");
      let status = log.distance < 15 ? "CRITICAL" : (log.distance < 35 ? "WARNING" : "SAFE");
      return <tr>
        <td style="color:#9ca3af"></td>
        <td style="font-weight:bold; color:#fff"></td>
        <td style="font-weight:bold; color:">m</td>
        <td><span style="background:20; color:; padding:3px 8px; border-radius:4px; font-size:0.75rem;"></span></td>
      </tr>;
    }).join("");
  }

  function clearHistory() {
    localStorage.setItem("radarHistory", "[]");
    renderHistoryTable();
    updateChart();
  }

  window.addEventListener("DOMContentLoaded", () => {
    initChart();
    renderHistoryTable();

    setInterval(() => {
      // 1. Render Weather
      try {
        const weatherStr = localStorage.getItem("weatherPrediction");
        if (weatherStr) {
          const w = JSON.parse(weatherStr);
          let color = w.condition === "CRITICAL" || w.condition === "DENSE" ? "#ff3b3b" : "#ffd740";
          if (w.condition === "CLEAR") color = "#00e676";
          document.getElementById("weatherBox").innerHTML = <span style="color:"> FOG</span> <span style="font-size:1rem; color:#888; margin-left:10px">(Density Score: )</span>;
        }
      } catch(e) {}

      // 2. Render Live Radar & Alerts
      try {
        const dataStr = localStorage.getItem("radarObjects");
        if (!dataStr) return;
        const obstacles = JSON.parse(dataStr);
        
        const liveList = document.getElementById("liveRadarList");
        const alertList = document.getElementById("alertBoxList");
        
        if (!obstacles || obstacles.length === 0) {
          liveList.innerHTML = "<div style=\"color:#00e676; font-size:1.2rem;\">? Path is completely clear.</div>";
          alertList.innerHTML = "<div style=\"color:#666; font-style:italic;\">No active alerts.</div>";
        } else {
          let liveHTML = "";
          let alertHTML = "";

          obstacles.forEach(obj => {
            let borderClass = "safe";
            let statusText = "SAFE";
            let color = "#00e676";
            
            if (obj.distance < 15) {
              borderClass = "critical"; statusText = "CRITICAL"; color = "#ff3b3b";
              alertHTML += <div class="alert-box">COLLISION IMMINENT:  at m. HALT VEHICLE.</div>;
            } else if (obj.distance < 35) {
              borderClass = "warning"; statusText = "WARNING"; color = "#ffd740";
              alertHTML += <div class="alert-box warn">PROXIMITY WARNING:  at m. Reduce speed.</div>;
            }

            liveHTML += 
              <div class="radar-item ">
                <div>
                  <div style="font-weight:bold; font-size:1.2rem; color:"></div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:1.5rem; font-weight:bold; color:#fff">m</div>
                </div>
              </div>
            ;
          });

          liveList.innerHTML = liveHTML;
          alertList.innerHTML = alertHTML || "<div style=\"color:#666; font-style:italic;\">No active alerts.</div>";
        }

        // 3. Render persistent history
        renderHistoryTable();
        updateChart();

      } catch (e) {
        console.error(e);
      }
    }, 1000);
  });
</script>
</body>
</html>'''

with open('radar.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Fixed radar.html")
