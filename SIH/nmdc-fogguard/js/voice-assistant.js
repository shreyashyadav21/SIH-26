// ============================================================
// MineSafe FogGuard – AI Voice Assistant System (v5.0 Universal)
// Full multi-tab voice navigation:
//   - "Radar" -> radar.html
//   - "Environment" / "Dashboard" -> environment.html
//   - "Video" / "Camera" / "Video AI" -> video-analysis.html
//   - "Training" / "Model" -> training.html
//   - "Home" -> index.html
// Works with Web Speech API across all tabs & browsers (including Brave)
// ============================================================

const VoiceAssistant = (() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;
  let isProcessing = false;
  let activeLang = 'en-US';
  let restartTimer = null;
  let synth = window.speechSynthesis;
  let uiMounted = false;

  // Local Web Audio stream & analyser
  let localStream = null;
  let audioContext = null;
  let analyser = null;
  let animFrame = null;

  // Detect Brave browser
  const isBrave = (navigator.brave && typeof navigator.brave.isBrave === 'function') ||
                  navigator.userAgent.includes('Brave');

  // DOM element caches
  let orbBtn = null;
  let panelEl = null;
  let statusTextEl = null;
  let heardTextEl = null;
  let badgeEl = null;
  let meterBar = null;
  let meterLabel = null;
  let waveBars = [];

  // Web Audio Synth for futuristic HUD chimes
  function playBeep(type = 'start') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContext && audioContext.state !== 'closed' ? audioContext : new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {}
  }

  // Voice output feedback
  function speak(text, onDone) {
    if (!synth) {
      if (onDone) onDone();
      return;
    }
    try {
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.98;
      utter.pitch = 1.05;
      utter.lang = activeLang;

      const voices = synth.getVoices();
      const preferred = voices.find(v => 
        /female|natural|samantha|aria|jenny|zira|google us/i.test(v.name) &&
        (v.lang || '').startsWith('en')
      ) || voices[0];

      if (preferred) utter.voice = preferred;

      let called = false;
      const finish = () => {
        if (!called) {
          called = true;
          if (onDone) onDone();
        }
      };

      utter.onend = finish;
      utter.onerror = finish;
      setTimeout(finish, 2000);

      synth.speak(utter);
    } catch (e) {
      if (onDone) onDone();
    }
  }

  function setStatus(statusMsg, isError = false) {
    if (!statusTextEl) return;
    statusTextEl.innerHTML = statusMsg;
    statusTextEl.style.color = isError ? '#ff4d4d' : '#00f2ff';
  }

  function setHeard(text, highlight = false) {
    if (!heardTextEl) return;
    if (highlight) {
      heardTextEl.innerHTML = `<span style="color:#00ff9d;font-weight:bold;">${text}</span>`;
    } else {
      heardTextEl.innerHTML = `<span style="color:#e2e8f0;">"${text}"</span>`;
    }
  }

  // Universal Command Router for all tabs
  function executeCommand(raw) {
    if (!raw || isProcessing) return false;
    const clean = raw.toLowerCase().trim();
    console.log('[VoiceAssistant] Evaluating voice command:', clean);

    // 1. RADAR TAB
    if (/\b(radar|radars|raider|redar|raydar|rider|fleet|radaar|radr|रडार)\b/i.test(clean)) {
      isProcessing = true;
      setHeard(raw, true);
      playBeep('success');

      const isAlreadyRadar = window.location.pathname.endsWith('radar.html');

      if (isAlreadyRadar) {
        setStatus('⚡ Already on Radar Command Center');
        speak('You are already on the Radar Command Center.');
        highlightRadarPanels();
        setTimeout(() => { isProcessing = false; }, 1200);
      } else {
        setStatus('🚀 Voice Command: Opening Radar Tab...');
        sessionStorage.setItem('minesfe_voice_assistant_listening', 'true');
        sessionStorage.setItem('minesfe_voice_last_msg', 'Radar Command Center online.');
        speak('Opening Radar tab.', () => {
          window.location.href = 'radar.html';
        });
        setTimeout(() => { window.location.href = 'radar.html'; }, 600);
      }
      return true;
    }

    // 2. ENVIRONMENT TAB
    if (/\b(environment|environ|environmental|dashboard|monitoring|weather|haul road|env)\b/i.test(clean)) {
      isProcessing = true;
      setHeard(raw, true);
      playBeep('success');
      const isAlreadyEnv = window.location.pathname.endsWith('environment.html');

      if (isAlreadyEnv) {
        setStatus('⚡ Already on Environment Dashboard');
        speak('You are already on the Environment Dashboard.');
        setTimeout(() => { isProcessing = false; }, 1200);
      } else {
        setStatus('🚀 Voice Command: Opening Environment Dashboard...');
        sessionStorage.setItem('minesfe_voice_assistant_listening', 'true');
        sessionStorage.setItem('minesfe_voice_last_msg', 'Environment monitoring online.');
        speak('Opening Environment Dashboard.', () => {
          window.location.href = 'environment.html';
        });
        setTimeout(() => { window.location.href = 'environment.html'; }, 600);
      }
      return true;
    }

    // 3. VIDEO AI TAB
    if (/\b(video|camera|cabin|in-cabin|dehaze|vision|feed|ai view)\b/i.test(clean)) {
      isProcessing = true;
      setHeard(raw, true);
      playBeep('success');

      const isAlreadyVideo = window.location.pathname.endsWith('video-analysis.html');

      if (isAlreadyVideo) {
        setStatus('⚡ Already on Video AI Display');
        speak('You are already on the Video AI Display.');
        setTimeout(() => { isProcessing = false; }, 1200);
      } else {
        setStatus('🚀 Voice Command: Opening Video AI Display...');
        sessionStorage.setItem('minesfe_voice_assistant_listening', 'true');
        sessionStorage.setItem('minesfe_voice_last_msg', 'Video AI In-Cabin Display active.');
        speak('Opening Video AI Display.', () => {
          window.location.href = 'video-analysis.html';
        });
        setTimeout(() => { window.location.href = 'video-analysis.html'; }, 600);
      }
      return true;
    }

    // 4. MODEL TRAINING TAB
    if (/\b(training|model|train|pipeline|yolo|ml)\b/i.test(clean)) {
      isProcessing = true;
      setHeard(raw, true);
      playBeep('success');
      const isAlreadyTrain = window.location.pathname.endsWith('training.html');

      if (isAlreadyTrain) {
        setStatus('⚡ Already on Model Training');
        speak('You are already on Model Training.');
        setTimeout(() => { isProcessing = false; }, 1200);
      } else {
        setStatus('🚀 Voice Command: Opening Model Training Pipeline...');
        sessionStorage.setItem('minesfe_voice_assistant_listening', 'true');
        sessionStorage.setItem('minesfe_voice_last_msg', 'Model Training Pipeline active.');
        speak('Opening Model Training Pipeline.', () => {
          window.location.href = 'training.html';
        });
        setTimeout(() => { window.location.href = 'training.html'; }, 600);
      }
      return true;
    }

    // 5. HOME TAB
    if (/\b(home|main|overview|start|index)\b/i.test(clean)) {
      isProcessing = true;
      setHeard(raw, true);
      playBeep('success');
      const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

      if (isHome) {
        setStatus('⚡ Already on Home page');
        speak('You are already on the Home page.');
        setTimeout(() => { isProcessing = false; }, 1200);
      } else {
        setStatus('🚀 Voice Command: Returning Home...');
        sessionStorage.setItem('minesfe_voice_assistant_listening', 'true');
        sessionStorage.setItem('minesfe_voice_last_msg', 'Welcome back to MineSafe Home.');
        speak('Navigating to Home.', () => {
          window.location.href = 'index.html';
        });
        setTimeout(() => { window.location.href = 'index.html'; }, 600);
      }
      return true;
    }

    // 6. CLEAR LOGS (if on radar)
    if (/\b(clear|reset|clear data|clear log|clear history)\b/i.test(clean)) {
      playBeep('success');
      if (typeof window.clearHistory === 'function') {
        window.clearHistory();
        setStatus('✅ Radar detection logs cleared');
        speak('Radar logs cleared.');
        return true;
      }
    }

    // 7. STATUS
    if (/\b(status|weather|report|condition)\b/i.test(clean)) {
      playBeep('success');
      let msg = 'MineSafe system operational. All sensors online.';
      try {
        const wStr = localStorage.getItem('weatherPrediction');
        if (wStr) {
          const w = JSON.parse(wStr);
          msg = `Current weather: ${w.condition} fog. Sensors active.`;
        }
      } catch (e) {}
      setStatus('ℹ️ ' + msg);
      speak(msg);
      return true;
    }

    // 8. HELP
    if (/\b(help|commands|what can i say|options)\b/i.test(clean)) {
      playBeep('success');
      const helpMsg = 'Say Radar, Environment, Video AI, Model Training, or Home.';
      setStatus('ℹ️ ' + helpMsg);
      speak(helpMsg);
      return true;
    }

    // Unrecognized speech
    setHeard(raw);
    setStatus(`Heard: "${raw}" (Say Radar, Environment, Video, Training, or Home)`);
    return false;
  }

  function highlightRadarPanels() {
    const panels = document.querySelectorAll('.radar-panel, .radar-item, .log-table');
    panels.forEach(p => {
      p.style.boxShadow = '0 0 30px rgba(0, 242, 255, 0.9)';
      p.style.borderColor = '#00f2ff';
      setTimeout(() => {
        p.style.boxShadow = '';
        p.style.borderColor = '';
      }, 1500);
    });
  }

  // -------------------------------------------------------------
  // Real-time Audio Visualizer
  // -------------------------------------------------------------
  async function startAudioMeter() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;

      if (!localStream || !localStream.active) {
        localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      if (!audioContext || audioContext.state === 'closed') {
        audioContext = new AudioCtx();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      const src = audioContext.createMediaStreamSource(localStream);
      src.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const monitorVoice = () => {
        if (!isListening) {
          if (meterBar) meterBar.style.width = '0%';
          return;
        }

        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i];
        const avg = sum / buffer.length;
        const volume = Math.min(100, Math.round((avg / 120) * 100));

        if (meterBar) {
          meterBar.style.width = Math.max(volume, 4) + '%';
          meterBar.style.background = volume > 18 ? '#00ff9d' : '#00f2ff';
        }

        if (meterLabel) {
          if (volume > 18) {
            meterLabel.textContent = `🎤 Voice Detected: ${volume}%`;
            meterLabel.style.color = '#00ff9d';
          } else {
            meterLabel.textContent = `🎤 Microphone Active (${volume}%)`;
            meterLabel.style.color = '#94a3b8';
          }
        }

        // Scale animated wave bars to physical voice level
        waveBars.forEach((bar, i) => {
          const val = buffer[i * 2] || avg;
          const h = Math.max(4, Math.min(26, Math.round((val / 255) * 26)));
          bar.style.height = h + 'px';
          bar.style.background = volume > 18 ? '#00ff9d' : '#00f2ff';
        });

        animFrame = requestAnimationFrame(monitorVoice);
      };

      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(monitorVoice);
      return true;
    } catch (err) {
      console.warn('[VoiceAssistant] Audio meter notice:', err);
      return false;
    }
  }

  // -------------------------------------------------------------
  // Full Speech Recognition Engine
  // -------------------------------------------------------------
  function initSpeechRecognition() {
    if (!SpeechRecognition) return null;
    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 5;
      rec.lang = activeLang;

      rec.onstart = () => {
        console.log('[VoiceAssistant] Speech recognition active');
      };

      rec.onresult = (e) => {
        let interim = '';
        let matchedCommand = '';

        for (let i = e.resultIndex; i < e.results.length; ++i) {
          const r = e.results[i];

          // Check ALL alternatives across ALL navigation categories!
          for (let j = 0; j < r.length; j++) {
            const alt = r[j].transcript.toLowerCase();

            // Radar
            if (/\b(radar|radars|raider|redar|raydar|rider|fleet)\b/i.test(alt)) {
              matchedCommand = 'radar';
              break;
            }
            // Environment
            if (/\b(environment|environ|dashboard|weather|monitoring|env)\b/i.test(alt)) {
              matchedCommand = 'environment';
              break;
            }
            // Video AI
            if (/\b(video|camera|cabin|in-cabin|dehaze|vision)\b/i.test(alt)) {
              matchedCommand = 'video';
              break;
            }
            // Model Training
            if (/\b(training|model|train|pipeline|yolo)\b/i.test(alt)) {
              matchedCommand = 'training';
              break;
            }
            // Home
            if (/\b(home|main|overview|start)\b/i.test(alt)) {
              matchedCommand = 'home';
              break;
            }
          }

          if (matchedCommand) break;

          if (r.isFinal) {
            matchedCommand = r[0].transcript;
          } else {
            interim += r[0].transcript;
          }
        }

        if (interim) {
          setHeard(interim);
        }

        if (matchedCommand) {
          executeCommand(matchedCommand);
        }
      };

      rec.onerror = (e) => {
        console.warn('[VoiceAssistant] SpeechRecognition error:', e.error);
        if (e.error === 'network' && isBrave) {
          // Brave shields notice
          setStatus('🦁 In Brave: Enable "Google services for speech" in brave://settings/privacy for full voice transcription, or tap buttons below.', true);
        }
      };

      rec.onend = () => {
        if (isListening && !isProcessing) {
          clearTimeout(restartTimer);
          restartTimer = setTimeout(() => {
            if (isListening && !isProcessing) {
              try { rec.start(); } catch (err) {}
            }
          }, 400);
        }
      };

      return rec;
    } catch (e) {
      return null;
    }
  }

  // Toggle Voice Assistant
  async function toggleListening() {
    expandPanel(true);

    if (isListening) {
      isListening = false;
      isProcessing = false;
      clearTimeout(restartTimer);
      cancelAnimationFrame(animFrame);

      if (recognition) {
        try { recognition.abort(); } catch (e) {}
      }
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        localStream = null;
      }

      updateVisualState(false);
      setStatus('Voice Assistant paused. Click below to start.');
      setHeard('Microphone offline.');
      sessionStorage.setItem('minesfe_voice_assistant_listening', 'false');
      return;
    }

    // Start Audio Meter & Speech Recognition
    await startAudioMeter();

    if (!recognition && SpeechRecognition) {
      recognition = initSpeechRecognition();
    }
    if (recognition) {
      try { recognition.start(); } catch (e) {}
    }

    isListening = true;
    sessionStorage.setItem('minesfe_voice_assistant_listening', 'true');
    updateVisualState(true);
    playBeep('start');

    setStatus('🔴 Listening... Say <b style="color:#00ff9d">"Radar"</b>, <b style="color:#00ff9d">"Environment"</b>, <b style="color:#00ff9d">"Video"</b>, etc.');
    setHeard('Speak any tab name now...');
  }

  function updateVisualState(listening) {
    if (!orbBtn) return;
    const svg = document.getElementById('minesfeVoiceSvg');
    const mainBtn = document.getElementById('minesfeVoiceMainBtn');

    if (listening) {
      orbBtn.classList.add('listening');
      if (badgeEl) badgeEl.textContent = 'REC';
      if (svg) svg.style.color = '#00ff9d';
      if (mainBtn) {
        mainBtn.innerHTML = '⏹️ Stop Listening';
        mainBtn.style.background = '#ff4d4d';
      }
    } else {
      orbBtn.classList.remove('listening');
      if (badgeEl) badgeEl.textContent = 'MIC';
      if (svg) svg.style.color = '#00f2ff';
      if (mainBtn) {
        mainBtn.innerHTML = '🎙️ Start Listening (Say Any Tab)';
        mainBtn.style.background = 'linear-gradient(135deg, #00f2ff, #0077ff)';
      }
    }
  }

  function expandPanel(open) {
    if (!panelEl) return;
    if (open) panelEl.classList.add('open');
    else panelEl.classList.remove('open');
  }

  function mountUI() {
    if (uiMounted || document.getElementById('minesfe-voice-widget')) return;
    uiMounted = true;

    const style = document.createElement('style');
    style.id = 'minesfe-voice-styles-v5';
    style.textContent = `
      #minesfe-voice-widget {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        font-family: 'Barlow Semi Condensed', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        user-select: none;
      }

      .minesfe-voice-orb {
        width: 62px;
        height: 62px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0a111a, #162438);
        border: 2px solid #00f2ff;
        box-shadow: 0 0 20px rgba(0, 242, 255, 0.4), inset 0 0 10px rgba(0, 242, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
      }

      .minesfe-voice-orb:hover {
        transform: scale(1.08);
        box-shadow: 0 0 32px rgba(0, 242, 255, 0.8);
      }

      .minesfe-voice-orb.listening {
        border-color: #00ff9d;
        background: linear-gradient(135deg, #042617, #0b1c14);
        box-shadow: 0 0 28px rgba(0, 255, 157, 0.7), inset 0 0 15px rgba(0, 255, 157, 0.3);
        animation: orbPulseV5 1.2s infinite alternate;
      }

      @keyframes orbPulseV5 {
        0% { transform: scale(1); box-shadow: 0 0 18px rgba(0, 255, 157, 0.5); }
        100% { transform: scale(1.08); box-shadow: 0 0 35px rgba(0, 255, 157, 0.9); }
      }

      .minesfe-voice-orb-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        background: #00f2ff;
        color: #050a14;
        font-size: 0.65rem;
        font-weight: 900;
        padding: 2px 6px;
        border-radius: 10px;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      }

      .minesfe-voice-orb.listening .minesfe-voice-orb-badge {
        background: #00ff9d;
        color: #050a14;
      }

      .minesfe-voice-panel {
        position: absolute;
        bottom: 74px;
        right: 0;
        width: 360px;
        background: rgba(10, 17, 28, 0.98);
        border: 1px solid rgba(0, 242, 255, 0.35);
        border-radius: 16px;
        box-shadow: 0 18px 45px rgba(0,0,0,0.85), 0 0 25px rgba(0, 242, 255, 0.25);
        backdrop-filter: blur(20px);
        padding: 16px;
        display: none;
        flex-direction: column;
        gap: 12px;
        animation: panelSlideV5 0.22s ease-out;
      }

      @keyframes panelSlideV5 {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .minesfe-voice-panel.open {
        display: flex;
      }

      .minesfe-voice-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        padding-bottom: 8px;
      }

      .minesfe-voice-title {
        font-size: 0.9rem;
        font-weight: 800;
        color: #00f2ff;
        letter-spacing: 1px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .minesfe-voice-close-btn {
        background: transparent;
        border: none;
        color: #64748b;
        font-size: 1.1rem;
        cursor: pointer;
        line-height: 1;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .minesfe-voice-close-btn:hover { color: #fff; }

      .minesfe-status-box {
        background: rgba(0,0,0,0.5);
        border: 1px solid rgba(0, 242, 255, 0.2);
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .minesfe-mic-meter-track {
        width: 100%;
        height: 6px;
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
        overflow: hidden;
      }

      .minesfe-mic-meter-bar {
        width: 0%;
        height: 100%;
        background: #00f2ff;
        border-radius: 3px;
        transition: width 0.08s ease, background 0.15s;
      }

      .minesfe-heard-box {
        font-size: 0.9rem;
        min-height: 24px;
        color: #fff;
      }

      .minesfe-voice-waves {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        height: 24px;
      }

      .minesfe-voice-wave-bar {
        width: 4px;
        height: 6px;
        background: #00f2ff;
        border-radius: 2px;
        transition: height 0.08s ease;
      }

      .minesfe-main-btn {
        width: 100%;
        padding: 11px;
        border: none;
        border-radius: 8px;
        font-size: 0.88rem;
        font-weight: 800;
        cursor: pointer;
        color: #050a14;
        background: linear-gradient(135deg, #00f2ff, #0077ff);
        box-shadow: 0 4px 15px rgba(0, 242, 255, 0.35);
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .minesfe-main-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(0, 242, 255, 0.5);
      }

      .minesfe-nav-tabs-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }

      .minesfe-tab-voice-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(0, 242, 255, 0.2);
        color: #e2e8f0;
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .minesfe-tab-voice-btn:hover {
        background: rgba(0, 242, 255, 0.18);
        border-color: #00f2ff;
        color: #00f2ff;
        transform: translateY(-1px);
      }

      .minesfe-tab-voice-btn.radar-btn {
        grid-column: span 2;
        background: rgba(0, 242, 255, 0.12);
        border-color: #00f2ff;
        color: #00f2ff;
        font-size: 0.85rem;
        font-weight: 800;
        justify-content: center;
      }
      .minesfe-tab-voice-btn.radar-btn:hover {
        background: #00f2ff;
        color: #050a14;
      }

      .minesfe-input-form {
        display: flex;
        gap: 6px;
      }

      .minesfe-input-form input {
        flex: 1;
        background: rgba(0,0,0,0.5);
        border: 1px solid rgba(0, 242, 255, 0.25);
        border-radius: 6px;
        padding: 7px 10px;
        color: #fff;
        font-size: 0.8rem;
        outline: none;
      }
      .minesfe-input-form input:focus { border-color: #00f2ff; }

      .minesfe-input-form button {
        background: #00f2ff;
        color: #050a14;
        border: none;
        border-radius: 6px;
        padding: 0 12px;
        font-weight: 800;
        font-size: 0.75rem;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'minesfe-voice-widget';
    container.innerHTML = `
      <div class="minesfe-voice-panel" id="minesfeVoicePanel">
        <div class="minesfe-voice-header">
          <div class="minesfe-voice-title">
            <span>🎙️</span> ALL-TAB VOICE ASSISTANT
          </div>
          <button class="minesfe-voice-close-btn" id="minesfeVoiceCloseBtn" title="Close Panel">✕</button>
        </div>

        <div class="minesfe-status-box">
          <div style="font-size:0.72rem;color:#94a3b8" id="minesfeVoiceStatusText">
            Say any tab: <b style="color:#00f2ff">"Radar"</b>, <b style="color:#00ff9d">"Environment"</b>, <b style="color:#ffd740">"Video"</b>, <b style="color:#ff7b4d">"Training"</b>
          </div>
          <div class="minesfe-heard-box" id="minesfeVoiceHeardText">
            <span style="color:#64748b">Listening for command...</span>
          </div>
          <!-- Live Audio Level Meter -->
          <div style="display:flex;justify-content:space-between;font-size:0.68rem;margin-top:4px">
            <span id="minesfeMeterLabel" style="color:#94a3b8">🎤 Microphone: Standby</span>
            <span style="color:#64748b">Live VU</span>
          </div>
          <div class="minesfe-mic-meter-track">
            <div class="minesfe-mic-meter-bar" id="minesfeMeterBar"></div>
          </div>
        </div>

        <div class="minesfe-voice-waves" id="minesfeVoiceWaves">
          <div class="minesfe-voice-wave-bar"></div>
          <div class="minesfe-voice-wave-bar"></div>
          <div class="minesfe-voice-wave-bar"></div>
          <div class="minesfe-voice-wave-bar"></div>
          <div class="minesfe-voice-wave-bar"></div>
          <div class="minesfe-voice-wave-bar"></div>
          <div class="minesfe-voice-wave-bar"></div>
        </div>

        <button class="minesfe-main-btn" id="minesfeVoiceMainBtn" onclick="VoiceAssistant.toggleListening()">
          🎙️ Start Listening (Say Any Tab)
        </button>

        <div style="font-size:0.68rem;color:#94a3b8;font-weight:700">SPOKEN VOICE COMMAND TARGETS:</div>
        <div class="minesfe-nav-tabs-grid">
          <button class="minesfe-tab-voice-btn radar-btn" onclick="VoiceAssistant.executeCommand('radar')">
            📡 Say "Radar" ➔ Radar Command Center
          </button>
          <button class="minesfe-tab-voice-btn" onclick="VoiceAssistant.executeCommand('environment')">
            🌫️ Say "Environment"
          </button>
          <button class="minesfe-tab-voice-btn" onclick="VoiceAssistant.executeCommand('video')">
            📹 Say "Video AI"
          </button>
          <button class="minesfe-tab-voice-btn" onclick="VoiceAssistant.executeCommand('training')">
            🧠 Say "Training"
          </button>
          <button class="minesfe-tab-voice-btn" onclick="VoiceAssistant.executeCommand('home')">
            🏠 Say "Home"
          </button>
        </div>

        <!-- Type command fallback -->
        <form class="minesfe-input-form" onsubmit="event.preventDefault(); const inp = document.getElementById('minesfeTypeInput'); if (inp.value) { VoiceAssistant.executeCommand(inp.value); inp.value = ''; }">
          <input type="text" id="minesfeTypeInput" placeholder="Say or type: 'radar', 'environment', 'video'..." autocomplete="off" />
          <button type="submit">Go</button>
        </form>

        <div style="display:flex;justify-content:space-between;font-size:0.68rem;color:#64748b;border-top:1px solid rgba(255,255,255,0.06);padding-top:6px">
          <span>All 5 Tabs Supported</span>
          <span>Hotkey: <b>Alt + V</b></span>
        </div>
      </div>

      <div class="minesfe-voice-orb" id="minesfeVoiceOrb" title="MineSafe Voice Assistant - Speak Any Tab">
        <div class="minesfe-voice-orb-badge" id="minesfeVoiceBadge">MIC</div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#00f2ff" id="minesfeVoiceSvg">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </div>
    `;

    document.body.appendChild(container);

    // Cache elements
    orbBtn = document.getElementById('minesfeVoiceOrb');
    panelEl = document.getElementById('minesfeVoicePanel');
    statusTextEl = document.getElementById('minesfeVoiceStatusText');
    heardTextEl = document.getElementById('minesfeVoiceHeardText');
    badgeEl = document.getElementById('minesfeVoiceBadge');
    meterBar = document.getElementById('minesfeMeterBar');
    meterLabel = document.getElementById('minesfeMeterLabel');
    waveBars = document.querySelectorAll('.minesfe-voice-wave-bar');

    const closeBtn = document.getElementById('minesfeVoiceCloseBtn');

    orbBtn.addEventListener('click', () => {
      toggleListening();
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panelEl.classList.remove('open');
    });

    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        toggleListening();
      }
    });

    // Check if assistant was active prior to navigation
    const wasListening = sessionStorage.getItem('minesfe_voice_assistant_listening');
    const lastMsg = sessionStorage.getItem('minesfe_voice_last_msg');

    if (lastMsg) {
      setStatus('✅ ' + lastMsg);
      setHeard('Ready for next voice command');
      expandPanel(true);
      sessionStorage.removeItem('minesfe_voice_last_msg');
    }

    if (wasListening === 'true') {
      setTimeout(() => {
        toggleListening();
      }, 500);
    }
  }

  function init() {
    mountUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init,
    toggleListening,
    executeCommand,
    speak,
    isListening: () => isListening
  };
})();

window.VoiceAssistant = VoiceAssistant;
