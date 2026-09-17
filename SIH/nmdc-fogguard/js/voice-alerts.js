// ============================================================
// NMDC FogGuard – Voice Alert System (Web Speech API)
// ============================================================

const VoiceAlerts = (() => {
  let synth = window.speechSynthesis;
  let enabled = true;
  let currentRate = 0.85;
  let currentPitch = 1.18;
  let currentVolume = 1.0;
  let currentLanguage = (window.I18n && I18n.getLanguage()) || 'en';
  let preferredVoice = null;
  let currentVoiceName = localStorage.getItem('minesfe_voice_name') || '';
  let alertQueue = [];
  let isSpeaking = false;
  let lastAlertLevel = null;
  let cooldownTimer = null;
  const COOLDOWN_MS = 5000;

  const ALERT_CONFIG = {
    CLEAR: {
      text: "Visibility clear. Normal operations permitted. All vehicles may proceed at standard speed.",
      rate: 0.95,
      pitch: 1.0,
      priority: 1,
      color: '#00e676'
    },
    MODERATE: {
      text: "Caution. Moderate fog detected. Visibility approximately 20 to 50 meters. Reduce vehicle speed to 20 kilometers per hour. Maintain safe following distance. Activate hazard lights.",
      rate: 0.88,
      pitch: 0.95,
      priority: 2,
      color: '#ffd740'
    },
    DENSE: {
      text: "ALERT. ALERT. Dense fog detected. Visibility below 10 meters. All dump trucks must reduce speed immediately. Activate all warning systems. Proceed with extreme caution.",
      rate: 0.82,
      pitch: 0.9,
      priority: 3,
      color: '#ff3b3b'
    },
    CRITICAL: {
      text: "EMERGENCY. CRITICAL FOG CONDITIONS. Visibility less than 3 meters. All vehicles halt immediately. Do not move until visibility improves. Contact control room. This is a critical safety alert.",
      rate: 0.78,
      pitch: 0.85,
      priority: 4,
      color: '#ff0000'
    },
    COLLISION: {
      text: "COLLISION WARNING. Vehicle proximity alert detected.",
      rate: 0.95,
      pitch: 1.0,
      priority: 5,
      color: '#ff3b3b'
    },
    SYSTEM_START: {
      text: "FogGuard system online. NMDC Bailadila mine safety monitoring active. All sensors operational. Monitoring fog conditions on haul roads.",
      rate: 0.92,
      pitch: 1.05,
      priority: 1,
      color: '#00d4ff'
    }
  };

  const ALERT_KEYS = {
    CLEAR: 'voice_clear', MODERATE: 'voice_moderate', DENSE: 'voice_dense',
    CRITICAL: 'voice_critical', COLLISION: 'voice_collision', SYSTEM_START: 'voice_system_start'
  };

  const ASSISTANT_VOICE_CANDIDATES = [
    'samantha', 'zira', 'aria', 'jenny', 'ava', 'daria', 'susan',
    'google us english', 'google uk english female',
    'microsoft aria', 'microsoft jenny', 'microsoft zira',
    'female', 'girl'
  ];

  function init() {
    if (!synth) {
      console.warn('[VoiceAlerts] SpeechSynthesis not supported');
      return false;
    }

    function loadVoice() {
      const voices = getAvailableVoices();
      let matchedVoice = null;

      if (currentVoiceName) {
        matchedVoice = voices.find(v => v.name === currentVoiceName);
      }

      if (!matchedVoice) {
        matchedVoice = chooseBestVoiceForLanguage(currentLanguage);
      }

      preferredVoice = matchedVoice || voices[0];
      if (preferredVoice) {
        currentVoiceName = preferredVoice.name;
        localStorage.setItem('minesfe_voice_name', preferredVoice.name);
      }
    }

    loadVoice();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoice;
    }

    return true;
  }

  function speak(text, config = {}) {
    if (!enabled || !synth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = config.rate || currentRate;
    utterance.pitch = config.pitch || currentPitch;
    utterance.volume = currentVolume;
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.lang = getSpeechLanguage();

    utterance.onstart = () => {
      isSpeaking = true;
      document.dispatchEvent(new CustomEvent('voiceAlertStart', { detail: { text, config } }));
    };

    utterance.onend = () => {
      isSpeaking = false;
      document.dispatchEvent(new CustomEvent('voiceAlertEnd'));
      processQueue();
    };

    utterance.onerror = () => {
      isSpeaking = false;
      processQueue();
    };

    synth.speak(utterance);
  }

  const VOICE_LANGUAGES = {
    en: 'en-US',
    hi: 'hi-IN',
    te: 'te-IN',
    kn: 'kn-IN',
    ta: 'ta-IN'
  };

  function getAvailableVoices() {
    if (!synth) return [];
    return synth.getVoices().sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      return aName.localeCompare(bName);
    });
  }

  function chooseBestVoiceForLanguage(lang) {
    const voices = getAvailableVoices();
    if (!voices.length) return null;

    const targetLang = (VOICE_LANGUAGES[lang] || 'en-US').toLowerCase();
    const naturalNames = /female|girl|zira|aria|samantha|jenny|ava|daria|susan|karen|daniel|rachel|susan/i;

    const sameLang = voices.filter(v => (v.lang || '').toLowerCase().startsWith(targetLang.slice(0, 2)));
    const naturalSameLang = sameLang.filter(v => naturalNames.test(v.name || ''));
    const naturalAnyLang = voices.filter(v => naturalNames.test(v.name || ''));

    return naturalSameLang[0] || sameLang[0] || naturalAnyLang[0] || voices[0];
  }

  function getSpeechLanguage() {
    const lang = currentLanguage || (window.I18n ? I18n.getLanguage() : 'en');
    return VOICE_LANGUAGES[lang] || 'en-US';
  }

  function setLanguage(lang) {
    const normalized = VOICE_LANGUAGES[lang] ? lang : 'en';
    currentLanguage = normalized;
    if (window.I18n) {
      I18n.setLanguage(normalized);
    }
    const preferred = chooseBestVoiceForLanguage(normalized);
    if (preferred) {
      setVoice(preferred.name);
    }
    return normalized;
  }

  function setVoice(name) {
    const voices = getAvailableVoices();
    const match = voices.find(v => v.name === name);
    if (match) {
      preferredVoice = match;
      currentVoiceName = match.name;
      localStorage.setItem('minesfe_voice_name', match.name);
      return match.name;
    }
    return currentVoiceName;
  }

  function getCurrentVoiceName() {
    return currentVoiceName || (preferredVoice && preferredVoice.name) || '';
  }

  function getVoiceOptions() {
    return getAvailableVoices();
  }

  function getLocalizedText(level) {
    const key = ALERT_KEYS[level];
    return window.I18n && key ? I18n.t(key) : ALERT_CONFIG[level]?.text;
  }

  function processQueue() {
    if (alertQueue.length === 0) return;
    const next = alertQueue.shift();
    speak(next.text, next.config);
  }

  function alert(level, customText = null) {
    if (!enabled) return;

    const config = ALERT_CONFIG[level];
    if (!config) return;

    const text = customText || getLocalizedText(level) || config.text;

    // Cancel current speech for high priority alerts
    if (config.priority >= 3 && isSpeaking) {
      synth.cancel();
      alertQueue = [];
    }

    // Cooldown for same alert level
    if (lastAlertLevel === level && cooldownTimer) return;

    lastAlertLevel = level;
    clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(() => { lastAlertLevel = null; }, COOLDOWN_MS);

    if (isSpeaking && config.priority < 3) {
      alertQueue.push({ text, config });
    } else {
      speak(text, config);
    }

    // Update UI voice display
    updateVoiceDisplay(text, config.color);
  }

  function updateVoiceDisplay(text, color) {
    const voiceTextEl = document.getElementById('voiceAlertText');
    if (voiceTextEl) {
      voiceTextEl.textContent = `"${text}"`;
      voiceTextEl.style.borderColor = color + '40';
      voiceTextEl.style.color = color;
    }

    // Animate wave bars
    const waveBars = document.querySelectorAll('.voice-bar');
    waveBars.forEach(bar => {
      bar.style.background = color;
    });
  }

  function vehicleAlert(vehicleId, proximity, fogLevel) {
    const text = `Vehicle ${vehicleId} alert. Proximity warning at ${proximity} meters. Fog level ${fogLevel}. Reduce speed immediately.`;
    alert('COLLISION', text);
  }

  function getLanguage() {
    return currentLanguage;
  }

  function roadAlert(roadName, condition) {
    const text = `Road alert. ${roadName} conditions: ${condition}. Adjust vehicle speed accordingly.`;
    speak(text, { rate: 0.85, pitch: 0.92 });
  }

  function setEnabled(val) { enabled = val; if (!val) synth.cancel(); }
  function setRate(val) { currentRate = parseFloat(val); }
  function setPitch(val) { currentPitch = parseFloat(val); }
  function setVolume(val) { currentVolume = parseFloat(val); }
  function toggle() { setEnabled(!enabled); return enabled; }
  function getEnabled() { return enabled; }
  function cancelAll() { synth.cancel(); alertQueue = []; isSpeaking = false; }
  function getConfig(level) { return ALERT_CONFIG[level]; }

  return {
    init, alert, vehicleAlert, roadAlert,
    setEnabled, setRate, setPitch, setVolume, toggle, getEnabled, cancelAll, getConfig,
    setLanguage, getLanguage, getSpeechLanguage, setVoice, getCurrentVoiceName, getVoiceOptions
  };
})();

// ============================================================
// Voice Panel UI Controller
// ============================================================
function initVoicePanel() {
  VoiceAlerts.init();

  const toggleBtn = document.getElementById('voiceToggleBtn');
  const rateSlider = document.getElementById('voiceRate');
  const pitchSlider = document.getElementById('voicePitch');
  const volSlider = document.getElementById('voiceVolume');
  const voiceLangSelect = document.getElementById('voiceLanguageSelect');
  const voiceSelect = document.getElementById('voiceSelect');
  const testClearBtn = document.getElementById('testClear');
  const testModerateBtn = document.getElementById('testModerate');
  const testDenseBtn = document.getElementById('testDense');
  const testCriticalBtn = document.getElementById('testCritical');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const enabled = VoiceAlerts.toggle();
      toggleBtn.textContent = enabled ? '🔊 Voice ON' : '🔇 Voice OFF';
      toggleBtn.className = enabled ? 'btn btn-primary' : 'btn btn-secondary';
    });
  }

  if (rateSlider) rateSlider.addEventListener('input', e => VoiceAlerts.setRate(e.target.value));
  if (pitchSlider) pitchSlider.addEventListener('input', e => VoiceAlerts.setPitch(e.target.value));
  if (volSlider) volSlider.addEventListener('input', e => VoiceAlerts.setVolume(e.target.value));

  if (voiceLangSelect) {
    voiceLangSelect.value = VoiceAlerts.getLanguage();
    voiceLangSelect.addEventListener('change', e => {
      const lang = VoiceAlerts.setLanguage(e.target.value);
      if (window.I18n) I18n.setLanguage(lang);
      VoiceAlerts.alert('SYSTEM_START');
    });
  }

  if (voiceSelect) {
    const populateVoices = () => {
      const voices = VoiceAlerts.getVoiceOptions();
      voiceSelect.innerHTML = voices.length
        ? voices.map(v => `<option value="${v.name}">${v.name} (${v.lang || 'unknown'})</option>`).join('')
        : '<option value="default">Default Browser Voice</option>';
      const selected = VoiceAlerts.getCurrentVoiceName();
      if (selected) voiceSelect.value = selected;
    };

    populateVoices();
    voiceSelect.addEventListener('change', e => {
      VoiceAlerts.setVoice(e.target.value);
      VoiceAlerts.alert('SYSTEM_START');
    });
  }

  if (testClearBtn) testClearBtn.addEventListener('click', () => VoiceAlerts.alert('CLEAR'));
  if (testModerateBtn) testModerateBtn.addEventListener('click', () => VoiceAlerts.alert('MODERATE'));
  if (testDenseBtn) testDenseBtn.addEventListener('click', () => VoiceAlerts.alert('DENSE'));
  if (testCriticalBtn) testCriticalBtn.addEventListener('click', () => VoiceAlerts.alert('CRITICAL'));

  // Auto announce system start
  setTimeout(() => VoiceAlerts.alert('SYSTEM_START'), 1500);
}

window.VoiceAlerts = VoiceAlerts;
window.initVoicePanel = initVoicePanel;
