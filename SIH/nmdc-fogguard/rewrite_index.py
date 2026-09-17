html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MineSafe | Home</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/dashboard.css">
  <style>
    /* Modern Hero Section */
    .hero { position: relative; min-height: 80vh; display: flex; align-items: center; background: #0a111a; overflow: hidden; }
    .hero::before { content:''; position:absolute; inset:0; background: radial-gradient(circle at center, rgba(0,212,255,0.05) 0%, #0a111a 70%); }
    .hero-content { position: relative; z-index: 10; text-align: center; max-width: 900px; margin: 0 auto; padding: 2rem; }
    .hero-title { font-size: 4.5rem; font-family: var(--font-display); color: #fff; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 2px; }
    .hero-title span { color: #00d4ff; text-shadow: 0 0 20px rgba(0,212,255,0.5); }
    .hero-subtitle { font-size: 1.2rem; color: #9ca3af; margin-bottom: 2.5rem; line-height: 1.6; }
    
    .btn-glow { background: #00d4ff; color: #0a111a; padding: 1rem 2.5rem; border-radius: 4px; font-weight: bold; font-family: var(--font-display); text-transform: uppercase; text-decoration: none; display: inline-block; transition: all 0.3s; box-shadow: 0 0 20px rgba(0,212,255,0.3); }
    .btn-glow:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(0,212,255,0.6); }

    /* Feature Cards */
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; padding: 2rem 4rem; background: #0a111a; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 2rem; transition: transform 0.3s; }
    .card:hover { transform: translateY(-5px); border-color: #00d4ff; }
    .card h3 { color: #00d4ff; font-family: var(--font-display); margin-bottom: 1rem; font-size: 1.3rem; letter-spacing: 1px; }
    .card p { color: #9ca3af; line-height: 1.6; font-size: 1rem; }
  </style>
</head>
<body>

<div class="app-container">
  <div class="sidebar">
    <div class="brand">
      <div class="logo"></div>
      <div class="brand-text">MINESAFE</div>
    </div>
    <ul class="navbar-nav">
      <li><a href="index.html" class="active">Home</a></li>
      <li><a href="video-analysis.html">Video AI</a></li>
      <li><a href="radar.html">Radar</a></li>
    </ul>
  </div>

  <div class="main-content" style="padding: 0; overflow-y: auto;">
    
    <div class="hero">
      <div class="hero-content">
        <h1 class="hero-title">MineSafe <span>AI</span></h1>
        <p class="hero-subtitle">
          Advanced visibility enhancement and object detection for hazardous mining environments. 
          Powered by high-performance WebGL dehazing, YOLO object detection, and Ollama AI threat analysis.
        </p>
        <a href="video-analysis.html" class="btn-glow">Launch AI Video Engine</a>
      </div>
    </div>

    <div class="features-grid">
      
      <div class="card">
        <h3>1. GPU Video Dehazing</h3>
        <p>Extreme clarity filter utilizing GPU hardware acceleration to cut through dense mining fog in real-time without dropping frame rates. Contrast and saturation are mathematically optimized for maximum visibility.</p>
      </div>

      <div class="card">
        <h3>2. YOLO Object Detection</h3>
        <p>Live AI bounding boxes detect heavy dump trucks, excavators, and personnel hidden in the fog. Provides instant distance estimations to prevent collisions.</p>
      </div>

      <div class="card">
        <h3>3. Ollama AI Engine</h3>
        <p>Deep integration with local LLaMA models via the Ollama App. The AI calculates optimal dehazing weights dynamically based on atmospheric density to guarantee the best possible view.</p>
      </div>

      <div class="card">
        <h3>4. Radar Analytics</h3>
        <p>Persistent proximity logging and threat analysis. Even if the video is closed, the system records every vehicle's distance over time to generate live approach-rate graphs and collision warnings.</p>
      </div>

    </div>

  </div>
</div>

</body>
</html>'''

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Updated index.html")
