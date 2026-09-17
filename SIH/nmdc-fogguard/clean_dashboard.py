import re

with open('dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the KPI card
old_kpi = r'''<div class="kpi-card kpi-info">
          <div class="kpi-header">
            <span class="kpi-label" data-i18n="active_vehicles">Active Vehicles</span>
            <div class="kpi-icon info">.*?</div>
          </div>
          <div class="kpi-value text-cyan" id="kpiActiveVehicles">6</div>
          <div class="kpi-sub">of 10 Dump Trucks</div>
          <div class="kpi-trend text-yellow">.*? 4 Halted / Caution</div>
        </div>'''

new_kpi = '''<div class="kpi-card kpi-info">
          <div class="kpi-header">
            <span class="kpi-label">AI Engine Status</span>
            <div class="kpi-icon info">?</div>
          </div>
          <div class="kpi-value text-cyan">ACTIVE</div>
          <div class="kpi-sub">Ollama + WebGL</div>
          <div class="kpi-trend text-cyan">? Processing Live</div>
        </div>'''

content = re.sub(old_kpi, new_kpi, content, flags=re.DOTALL)

# Replace the Radar Section
old_radar = r'''<!-- Radar Section -->\s*<div class="chart-card" style="padding:0;overflow:hidden;background:#0a111a; border: 1px solid #1f2937;">.*?</div>\s*</div>\s*<!-- Production \+ Fog Distribution -->'''

new_admin_log = '''<!-- Administrator Logs -->
        <div class="chart-card" style="padding:0;overflow:hidden;background:#0a111a; border: 1px solid #1f2937;">
          <div style="padding:1.25rem 1.5rem 0.75rem; border-bottom: 1px solid #1f2937;" class="chart-header">
            <div class="chart-title" style="color:#00d4ff; font-size:1.1rem; letter-spacing: 2px;">ADMINISTRATOR SYSTEM LOGS</div>
            <div class="gps-tools">
              <span class="gps-status" style="color:#00e676; font-weight: bold;">? RECORDING</span>
            </div>
          </div>
          <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 12px; height: 350px; overflow-y: auto;">
             
             <div style="display:flex; justify-content:space-between; align-items:center; background:#111827; padding:15px 20px; border-radius:8px; border-left:5px solid #00d4ff">
                <div>
                   <div style="font-weight:bold; font-size:1.1rem; color:#fff">Ollama Optimization Complete</div>
                   <div style="font-size:0.85rem; color:#9ca3af; margin-top:4px">Contrast: 2.2x, Brightness: 1.1x</div>
                </div>
                <div style="text-align:right">
                   <div style="font-size:0.8rem; color:#00d4ff; font-weight:bold; letter-spacing:1px;">SYSTEM</div>
                </div>
             </div>
             
             <div style="display:flex; justify-content:space-between; align-items:center; background:#111827; padding:15px 20px; border-radius:8px; border-left:5px solid #ff3b3b">
                <div>
                   <div style="font-weight:bold; font-size:1.1rem; color:#fff">DENSE FOG ALERT</div>
                   <div style="font-size:0.85rem; color:#9ca3af; margin-top:4px">Atmospheric density reached 72%</div>
                </div>
                <div style="text-align:right">
                   <div style="font-size:0.8rem; color:#ff3b3b; font-weight:bold; letter-spacing:1px;">ENVIRONMENT</div>
                </div>
             </div>

             <div style="display:flex; justify-content:space-between; align-items:center; background:#111827; padding:15px 20px; border-radius:8px; border-left:5px solid #ffd740">
                <div>
                   <div style="font-weight:bold; font-size:1.1rem; color:#fff">Humidity Spike Detected</div>
                   <div style="font-size:0.85rem; color:#9ca3af; margin-top:4px">Sector 4 reported 94% humidity</div>
                </div>
                <div style="text-align:right">
                   <div style="font-size:0.8rem; color:#ffd740; font-weight:bold; letter-spacing:1px;">SENSOR</div>
                </div>
             </div>
             
             <div style="display:flex; justify-content:space-between; align-items:center; background:#111827; padding:15px 20px; border-radius:8px; border-left:5px solid #00e676">
                <div>
                   <div style="font-weight:bold; font-size:1.1rem; color:#fff">WebGL Dehazer Online</div>
                   <div style="font-size:0.85rem; color:#9ca3af; margin-top:4px">Frame processing stable at 60 FPS</div>
                </div>
                <div style="text-align:right">
                   <div style="font-size:0.8rem; color:#00e676; font-weight:bold; letter-spacing:1px;">SYSTEM</div>
                </div>
             </div>
          </div>
        </div>
        <!-- Production + Fog Distribution -->'''

content = re.sub(old_radar, new_admin_log, content, flags=re.DOTALL)

with open('dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated dashboard.html successfully.")
