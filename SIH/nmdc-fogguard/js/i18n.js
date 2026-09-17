// ============================================================
// NMDC FogGuard – Multi-Language i18n Translation Engine
// Languages Supported: English (en), Hindi (hi), Telugu (te), Kannada (kn), Tamil (ta)
// ============================================================

const I18n = (() => {
  let currentLang = localStorage.getItem('minesfe_lang') || localStorage.getItem('fogguard_lang') || 'en';

  const translations = {
    en: {
      nav_home: 'Home',
      nav_dashboard: 'Dashboard',
      nav_video: 'Video AI',
      nav_fleet: 'Fleet Map',
      nav_training: 'Model Training',
      nav_status: 'AI Active',
      language_label: 'Language',
      assistant_label: 'Safety assistant ready',
      assistant_hint: 'Use the dashboard controls or upload a video for guidance.',
      status_online: 'System Online',
      status_model_ready: 'Model Ready',
      status_ai_ready: 'AI Ready',
      status_gps_live: 'GPS Live',
      voice_system_start: 'FogGuard system online. NMDC Bailadila mine safety monitoring is active. All sensors are operational.',
      voice_clear: 'Visibility is clear. Normal operations are permitted. Vehicles may proceed at standard speed.',
      voice_moderate: 'Caution. Moderate fog detected. Reduce speed to 20 kilometers per hour and maintain a safe following distance.',
      voice_dense: 'Alert. Dense fog detected. Reduce speed immediately, activate warning systems, and proceed with extreme caution.',
      voice_critical: 'Emergency. Critical fog conditions. Stop all vehicles immediately and contact the control room.',
      voice_collision: 'Collision warning. Vehicle proximity detected. Slow down and prepare to stop.',

      hero_eyebrow: '🏭 NMDC · Bailadila Iron Ore Mines · AI Mine Safety System',
      hero_title_1: 'MinesFE',
      hero_title_2: 'Mine Safety Platform',
      hero_subtitle: 'AI-powered fog clearing and real-time guidance for dumper drivers in Bailadila hilltop mines. Supporting NMDC\'s 100 MTPA production vision.',
      btn_dashboard: '🖥️ Command Center',
      btn_video: '🎬 Clear Video Fog',

      fog_clear: 'CLEAR',
      fog_moderate: 'MODERATE FOG',
      fog_dense: 'DENSE FOG',
      fog_critical: 'CRITICAL FOG',

      vis_label: 'Visibility',
      fog_score: 'Fog Density',
      confidence: 'Confidence',
      max_speed: 'Recommended Speed',
      safe_speed: 'Safe to Proceed',

      ai_view_mode: 'AI VIEW MODE:',
      btn_view_dehazed: '✨ AI Dehazed Real View',
      btn_view_split: '🌗 Split Screen',
      btn_view_detection: '🎯 Obstacle AI Tags',
      btn_view_original: '📹 Raw Foggy Input',

      voice_alert_on: '🔊 Voice ON',
      voice_alert_off: '🔇 Voice OFF',

      cabin_assistant_title: '🚛 DRIVER CABIN ASSISTANT',
      cabin_status_safe: '✅ Safe Road Ahead — Proceed at normal speed (max 40 km/h)',
      cabin_status_dense: '⚠️ Thick fog ahead on Hilltop Sector 3 — Maintain distance & max 10 km/h',
      cabin_status_critical: '🚨 CRITICAL FOG — STOP VEHICLE IMMEDIATELY AND TURN ON HAZARDS',

      sos_button: '🆘 EMERGENCY SOS DISPATCH',
      sos_alert: 'Emergency SOS Signal Sent to Bailadila Mining Control Room!'
    },

    hi: {
      nav_home: 'मुख्य पृष्ठ',
      nav_dashboard: 'कमांड सेंटर',
      nav_video: 'वीडियो एआई',
      nav_fleet: 'वाहन नक्शा',
      nav_training: 'मॉडल ट्रेनिंग',
      nav_status: 'एआई सक्रिय',
      language_label: 'भाषा',
      assistant_label: 'सुरक्षा सहायक तैयार है',
      assistant_hint: 'मार्गदर्शन के लिए डैशबोर्ड नियंत्रण या वीडियो अपलोड का उपयोग करें।',
      status_online: 'सिस्टम ऑनलाइन',
      status_model_ready: 'मॉडल तैयार',
      status_ai_ready: 'एआई तैयार',
      status_gps_live: 'जीपीएस लाइव',
      voice_system_start: 'फॉगगार्ड सिस्टम ऑनलाइन है। एनएमडीसी बैलाडीला खदान सुरक्षा निगरानी सक्रिय है। सभी सेंसर चालू हैं।',
      voice_clear: 'दृश्यता साफ़ है। सामान्य कार्यवाही की अनुमति है। वाहन सामान्य गति से आगे बढ़ सकते हैं।',
      voice_moderate: 'सावधान। मध्यम कोहरा पाया गया है। गति 20 किलोमीटर प्रति घंटा करें और सुरक्षित दूरी बनाए रखें।',
      voice_dense: 'चेतावनी। घना कोहरा पाया गया है। तुरंत गति कम करें, चेतावनी प्रणाली चालू करें और बहुत सावधानी से चलें।',
      voice_critical: 'आपातकाल। अत्यधिक घना कोहरा है। सभी वाहन तुरंत रोकें और नियंत्रण कक्ष से संपर्क करें।',
      voice_collision: 'टक्कर की चेतावनी। वाहन बहुत पास है। गति कम करें और रुकने के लिए तैयार रहें।',

      hero_eyebrow: '🏭 एनएमडीसी · बैलाडीला लौह अयस्क खदान · एआई सुरक्षा प्लेटफॉर्म',
      hero_title_1: 'माइन्सएफई',
      hero_title_2: 'खान सुरक्षा प्रणाली',
      hero_subtitle: 'बैलाडीला खदानों में घने कोहरे को हटाने और डंपर चालकों की सहायता के लिए एआई तकनीक। एनएमडीसी के 100 मीट्रिक टन लक्ष्य के लिए प्रतिबद्ध।',
      btn_dashboard: '🖥️ कमांड सेंटर खोलें',
      btn_video: '🎬 वीडियो से कोहरा हटाएं',

      fog_clear: 'साफ़ मौसम',
      fog_moderate: 'मध्यम कोहरा',
      fog_dense: 'घना कोहरा',
      fog_critical: 'अत्यधिक खतरनाक कोहरा',

      vis_label: 'दृश्यता',
      fog_score: 'कोहरा घनत्व',
      confidence: 'सटीकता',
      max_speed: 'सलाह दी गई गति',
      safe_speed: 'आगे बढ़ना सुरक्षित है',

      ai_view_mode: 'एआई दृश्य मोड:',
      btn_view_dehazed: '✨ एआई साफ़ वास्तविक दृश्य',
      btn_view_split: '🌗 विभाजित स्क्रीन',
      btn_view_detection: '🎯 वाहन व बाधा पहचान',
      btn_view_original: '📹 मूल कोहरे वाला वीडियो',

      voice_alert_on: '🔊 आवाज़ चालू',
      voice_alert_off: '🔇 आवाज़ बंद',

      cabin_assistant_title: '🚛 ड्राइवर केबिन सुरक्षा सहायक',
      cabin_status_safe: '✅ रास्ता साफ़ है — सामान्य गति (अधिकतम 40 किमी/घंटा) से चलें',
      cabin_status_dense: '⚠️ पहाड़ी मार्ग 3 पर घना कोहरा — दूरी बनाएं और गति 10 किमी/घंटा रखें',
      cabin_status_critical: '🚨 अत्यधिक खतरनाक कोहरा — तुरंत गाड़ी रोकें और इंडिकेटर चालू करें',

      sos_button: '🆘 आपातकालीन एसओएस सहायता',
      sos_alert: 'आपातकालीन एसओएस संदेश बैलाडीला कंट्रोल रूम को भेज दिया गया है!'
    },

    te: {
      nav_home: 'హోమ్',
      nav_dashboard: 'కమాండ్ సెంటర్',
      nav_video: 'వీడియో AI',
      nav_fleet: 'వాహన మ్యాప్',
      nav_training: 'మోడల్ శిక్షణ',
      nav_status: 'AI సిద్ధంగా ఉంది',
      language_label: 'భాష', assistant_label: 'భద్రతా సహాయకుడు సిద్ధంగా ఉన్నారు', assistant_hint: 'మార్గదర్శనం కోసం డ్యాష్‌బోర్డ్ నియంత్రణలు లేదా వీడియోను ఉపయోగించండి.', status_online: 'సిస్టమ్ ఆన్‌లైన్', status_model_ready: 'మోడల్ సిద్ధంగా ఉంది', status_ai_ready: 'AI సిద్ధంగా ఉంది', status_gps_live: 'GPS లైవ్',
      voice_system_start: 'ఫాగ్‌గార్డ్ సిస్టమ్ ఆన్‌లైన్‌లో ఉంది. అన్ని సెన్సార్లు పనిచేస్తున్నాయి.', voice_clear: 'దృశ్యమానత స్పష్టంగా ఉంది. సాధారణ వేగంతో వెళ్లవచ్చు.', voice_moderate: 'జాగ్రత్త. మధ్యస్థ పొగమంచు ఉంది. వేగాన్ని గంటకు 20 కిలోమీటర్లకు తగ్గించండి.', voice_dense: 'హెచ్చరిక. దట్టమైన పొగమంచు ఉంది. వెంటనే వేగం తగ్గించి జాగ్రత్తగా వెళ్లండి.', voice_critical: 'అత్యవసరం. అత్యంత ప్రమాదకర పొగమంచు. అన్ని వాహనాలను వెంటనే ఆపండి.', voice_collision: 'ఢీకొనే ప్రమాద హెచ్చరిక. వేగం తగ్గించి ఆగడానికి సిద్ధంగా ఉండండి.',

      hero_eyebrow: '🏭 NMDC · బైలాడిలా ఇనుప ఖనిజ గనులు · AI భద్రతా వ్యవస్థ',
      hero_title_1: 'MinesFE',
      hero_title_2: 'గని భద్రతా వేదిక',
      hero_subtitle: 'బైలాడిలా గనులలో దట్టమైన పొగమంచును తొలగించి డంపర్ డ్రైవర్లకు నిజసమయ భద్రతను అందించే AI పరిజ్ఞానం.',
      btn_dashboard: '🖥️ కమాండ్ సెంటర్ ప్రారంభించండి',
      btn_video: '🎬 వీడియొ పొగమంచు తొలగించండి',

      fog_clear: 'స్పష్టమైన వాతావరణం',
      fog_moderate: 'మధ్యస్థ పొగమంచు',
      fog_dense: 'దట్టమైన పొగమంచు',
      fog_critical: 'అత్యంత ప్రమాదకర పొగమంచు',

      vis_label: 'దృశ్యమానత',
      fog_score: 'పొగమంచు సాంద్రత',
      confidence: 'ఖచ్చితత్వం',
      max_speed: 'సూచించిన వేగం',
      safe_speed: 'సురక్షితమైన ప్రయాణం',

      ai_view_mode: 'AI వీక్షణ మోడ్:',
      btn_view_dehazed: '✨ AI స్పష్టమైన నిజ వీక్షణ',
      btn_view_split: '🌗 విభజిత స్క్రీన్',
      btn_view_detection: '🎯 వాహన గుర్తింపు',
      btn_view_original: '📹 అసలు పొగమంచు వీడియో',

      voice_alert_on: '🔊 వాయిస్ ఆన్',
      voice_alert_off: '🔇 వాయిస్ ఆఫ్',

      cabin_assistant_title: '🚛 డ్రైవర్ క్యాబిన్ సెక్యూరిటీ అసిస్టెంట్',
      cabin_status_safe: '✅ రహదారి స్పష్టంగా ఉంది — సాధారణ వేగంతో వెళ్లండి (గరిష్టంగా 40 కిమీ/గం)',
      cabin_status_dense: '⚠️ హిల్‌టాప్ సెక్టార్ 3 లో దట్టమైన పొగమంచు — వేగం 10 కిమీ/గం తగ్గించండి',
      cabin_status_critical: '🚨 అత్యంత ప్రమాదకరమైన పొగమంచు — వెంటనే వాహనాన్ని నిలిపివేయండి',

      sos_button: '🆘 అత్యవసర SOS హెచ్చరిక',
      sos_alert: 'అత్యవసర SOS సిగ్నల్ బైలాడిలా కంట్రోల్ రూమ్‌కు పంపబడింది!'
    },

    kn: {
      nav_home: 'ಮುಖ್ಯ ಪುಟ',
      nav_dashboard: 'ಕಮಾಂಡ್ ಸೆಂಟರ್',
      nav_video: 'ವೀಡಿಯೊ AI',
      nav_fleet: 'ವಾಹನ ನಕ್ಷೆ',
      nav_training: 'ಮಾದರಿ ತರಬೇತಿ',
      nav_status: 'AI ಸಕ್ರಿಯವಾಗಿದೆ',
      language_label: 'ಭಾಷೆ', assistant_label: 'ಸುರಕ್ಷತಾ ಸಹಾಯಕ ಸಿದ್ಧವಾಗಿದೆ', assistant_hint: 'ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ನಿಯಂತ್ರಣಗಳು ಅಥವಾ ವೀಡಿಯೊ ಬಳಸಿ.', status_online: 'ಸಿಸ್ಟಂ ಆನ್‌ಲೈನ್', status_model_ready: 'ಮಾದರಿ ಸಿದ್ಧ', status_ai_ready: 'AI ಸಿದ್ಧ', status_gps_live: 'GPS ಲೈವ್',
      voice_system_start: 'ಫಾಗ್‌ಗಾರ್ಡ್ ಸಿಸ್ಟಂ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದೆ. ಎಲ್ಲಾ ಸೆನ್ಸರ್‌ಗಳು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ.', voice_clear: 'ದೃಶ್ಯತೆ ಸ್ಪಷ್ಟವಾಗಿದೆ. ಸಾಮಾನ್ಯ ವೇಗದಲ್ಲಿ ಮುಂದುವರಿಯಬಹುದು.', voice_moderate: 'ಎಚ್ಚರಿಕೆ. ಮಧ್ಯಮ ಮಂಜು ಇದೆ. ವೇಗವನ್ನು ಗಂಟೆಗೆ 20 ಕಿಲೋಮೀಟರ್‌ಗೆ ಇಳಿಸಿ.', voice_dense: 'ಎಚ್ಚರಿಕೆ. ದಟ್ಟ ಮಂಜು ಇದೆ. ತಕ್ಷಣ ವೇಗ ಇಳಿಸಿ ಎಚ್ಚರಿಕೆಯಿಂದ ಮುಂದುವರಿಯಿರಿ.', voice_critical: 'ತುರ್ತು. ಅತ್ಯಂತ ಅಪಾಯಕಾರಿ ಮಂಜು. ಎಲ್ಲಾ ವಾಹನಗಳನ್ನು ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ.', voice_collision: 'ಡಿಕ್ಕಿ ಎಚ್ಚರಿಕೆ. ವೇಗ ಇಳಿಸಿ ನಿಲ್ಲಲು ಸಿದ್ಧರಾಗಿ.',

      hero_eyebrow: '🏭 NMDC · ಬೈಲಾಡಿಲಾ ಕಬ್ಬಿಣದ ಅದಿರು ಗಣಿ · AI ಸುರಕ್ಷತಾ ವೇದಿಕೆ',
      hero_title_1: 'MinesFE',
      hero_title_2: 'ಗಣಿ ಸುರಕ್ಷತಾ ವ್ಯವಸ್ಥೆ',
      hero_subtitle: 'ಬೈಲಾಡಿಲಾ ಗಣಿಗಳಲ್ಲಿ ದಟ್ಟ ಮಂಜನ್ನು ನಿವಾರಿಸಿ ಡುಂಪರ್ ಚಾಲಕರಿಗೆ ನೈಜ-ಸಮಯದ ಸುರಕ್ಷತಾ ಮಾರ್ಗದರ್ಶನ ನೀಡುವ AI ತಂತ್ರಜ್ಞಾನ.',
      btn_dashboard: '🖥️ ಕಮಾಂಡ್ ಸೆಂಟರ್ ತೆರೆಯಿರಿ',
      btn_video: '🎬 ಮಂಜು ತೆರವುಗೊಳಿಸಿ',

      fog_clear: 'ಸ್ಪಷ್ಟ ವಾತಾವರಣ',
      fog_moderate: 'ಮಧ್ಯಮ ಮಂಜು',
      fog_dense: 'ದಟ್ಟವಾದ ಮಂಜು',
      fog_critical: 'ಅತ್ಯಂತ ಅಪಾಯಕಾರಿ ಮಂಜು',

      vis_label: 'ದೃಶ್ಯತೆ',
      fog_score: 'ಮಂಜಿನ ಸಾಂದ್ರತೆ',
      confidence: 'ನಿಖರತೆ',
      max_speed: 'ಸೂಚಿಸಿದ ವೇಗ',
      safe_speed: 'ಸುರಕ್ಷಿತ ಚಾಲನೆ',

      ai_view_mode: 'AI ವೀಕ್ಷಣೆ ಮೋಡ್:',
      btn_view_dehazed: '✨ AI ಸ್ಪಷ್ಟ ನಿಜ ವೀಕ್ಷಣೆ',
      btn_view_split: '🌗 ವಿಭಜಿತ ಪರದೆ',
      btn_view_detection: '🎯 ವಾಹನ ಪತ್ತೆ',
      btn_view_original: '📹 ಮೂಲ ಮಂಜಿನ ವೀಡಿಯೊ',

      voice_alert_on: '🔊 ಧ್ವನಿ ಚಾಲಿತ',
      voice_alert_off: '🔇 ಧ್ವನಿ ರದ್ದು',

      cabin_assistant_title: '🚛 ಚಾಲಕ ಕ್ಯಾಬಿನ್ ಸುರಕ್ಷತಾ ಸಹಾಯಕ',
      cabin_status_safe: '✅ ರಸ್ತೆ ಸ್ಪಷ್ಟವಾಗಿದೆ — ಸಾಮಾನ್ಯ ವೇಗದಲ್ಲಿ ಸಾಗಿ (ಗರಿಷ್ಠ 40 ಕಿಮೀ/ಗಂಟೆ)',
      cabin_status_dense: '⚠️ ಹಿಲ್‌ಟಾಪ್ ವಲಯ 3 ರಲ್ಲಿ ದಟ್ಟ ಮಂಜು — ವೇಗ 10 ಕಿಮೀ/ಗಂಟೆಗೆ ಇಳಿಸಿ',
      cabin_status_critical: '🚨 ಅತ್ಯಂತ ಅಪಾಯಕಾರಿ ಮಂಜು — ತಕ್ಷಣ ವಾಹನ ನಿಲ್ಲಿಸಿ ಹ್ಯಾಝಾರ್ಡ್ ಲೈಟ್ ಹಾಕಿ',

      sos_button: '🆘 ತುರ್ತು SOS ಸಂದೇಶ',
      sos_alert: 'ತುರ್ತು SOS ಸಂದೇಶವನ್ನು ಬೈಲಾಡಿಲಾ ನಿಯಂತ್ರಣ ಕೊಠಡಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ!'
    },

    ta: {
      nav_home: 'முகப்பு',
      nav_dashboard: 'கட்டுப்பாட்டு மையம்',
      nav_video: 'வீடியோ AI',
      nav_fleet: 'வாகன வரைபடம்',
      nav_training: 'மாதிரி பயிற்சி',
      nav_status: 'AI இயங்குகிறது',
      language_label: 'மொழி', assistant_label: 'பாதுகாப்பு உதவியாளர் தயார்', assistant_hint: 'வழிகாட்டுதலுக்கு டாஷ்போர்டு கட்டுப்பாடுகள் அல்லது வீடியோவைப் பயன்படுத்தவும்.', status_online: 'அமைப்பு ஆன்லைன்', status_model_ready: 'மாதிரி தயார்', status_ai_ready: 'AI தயார்', status_gps_live: 'GPS நேரலை',
      voice_system_start: 'ஃபாக் கார்டு அமைப்பு ஆன்லைனில் உள்ளது. அனைத்து சென்சார்களும் செயல்படுகின்றன.', voice_clear: 'தெரிவுத்திறன் தெளிவாக உள்ளது. இயல்பான வேகத்தில் செல்லலாம்.', voice_moderate: 'எச்சரிக்கை. மிதமான பனிமூட்டம் உள்ளது. வேகத்தை மணிக்கு 20 கிலோமீட்டராகக் குறைக்கவும்.', voice_dense: 'எச்சரிக்கை. அடர்ந்த பனிமூட்டம் உள்ளது. உடனடியாக வேகத்தைக் குறைத்து கவனமாகச் செல்லவும்.', voice_critical: 'அவசரம். மிகவும் ஆபத்தான பனிமூட்டம். அனைத்து வாகனங்களையும் உடனடியாக நிறுத்தவும்.', voice_collision: 'மோதல் எச்சரிக்கை. வேகத்தைக் குறைத்து நிறுத்தத் தயாராகவும்.',

      hero_eyebrow: '🏭 NMDC · பைலாடிலா இரும்பு தாது சுரங்கம் · AI பாதுகாப்பு தளம்',
      hero_title_1: 'MinesFE',
      hero_title_2: 'சுரங்க பாதுகாப்பு அமைப்பு',
      hero_subtitle: 'பைலாடிலா சுரங்கங்களில் அடர்ந்த பனியை அகற்றி ஓட்டுநர்களுக்கு நேரலை பாதுகாப்பு வழிகாட்டுதல் அளிக்கும் AI தொழில்நுட்பம்.',
      btn_dashboard: '🖥️ கட்டுப்பாட்டு மையம் திறக்கவும்',
      btn_video: '🎬 பனியை அகற்று',

      fog_clear: 'தெளிவான வானிலை',
      fog_moderate: 'மிதமான பனிமூட்டம்',
      fog_dense: 'அடர்ந்த பனிமூட்டம்',
      fog_critical: 'மிகவும் ஆபத்தான பனிமூட்டம்',

      vis_label: 'பார்வைத்திறன்',
      fog_score: 'பனி அடர்த்தி',
      confidence: 'துல்லியம்',
      max_speed: 'பரிந்துரைக்கப்பட்ட வேகம்',
      safe_speed: 'பாதுகாப்பான பயணம்',

      ai_view_mode: 'AI பார்வை முறை:',
      btn_view_dehazed: '✨ AI தெளிவான உண்மை பார்வை',
      btn_view_split: '🌗 பிரிக்கப்பட்ட திரை',
      btn_view_detection: '🎯 வாகன கண்டறிதல்',
      btn_view_original: '📹 மூல பனி வீடியோ',

      voice_alert_on: '🔊 குரல் ஆன்',
      voice_alert_off: '🔇 குரல் ஆஃப்',

      cabin_assistant_title: '🚛 ஓட்டுநர் கேபின் பாதுகாப்பு உதவியாளர்',
      cabin_status_safe: '✅ பாதை தெளிவாக உள்ளது — சாதாரண வேகத்தில் செல்லவும் (அதிகபட்சம் 40 கி.மீ/மணி)',
      cabin_status_dense: '⚠️ மலைப்பகுதியில் அடர்ந்த பனி — வேகத்தை 10 கி.மீ/மணியாக குறைக்கவும்',
      cabin_status_critical: '🚨 மிகவும் ஆபத்தான பனி — உடனடியாக வாகனத்தை நிறுத்தவும்',

      sos_button: '🆘 அவசர SOS உதவி',
      sos_alert: 'அவசர SOS செய்தி பைலாடிலா கட்டுப்பாட்டு அறைக்கு அனுப்பப்பட்டது!'
    }
  };

  const pageCopy = {
    en: {
      home_eyebrow: '🏭 NMDC · Bailadila Iron Ore Mines · AI Safety System', home_title_1: 'MinesFE', home_title_2: 'Intelligence', home_title_3: 'Platform', home_subtitle: 'AI-powered fog detection and vehicle guidance for NMDC\'s Bailadila mines. Enabling safe, efficient dumper operations during severe monsoon low-visibility conditions using computer vision, real-time analytics, and voice alerts.', home_btn_dashboard: '🖥️ Open Command Center', home_btn_video: '🎬 Analyze Video', stat_current: 'MTPA Current Production', stat_target: 'MTPA Target by 2030', stat_visibility: 'Min Visibility in Fog', stat_monsoon: 'Monsoon Months Affected', stat_sensors: 'AI Sensors Per Vehicle', challenge_label: 'The Challenge', challenge_title: 'Why Bailadila Mines Need MinesFE', challenge_subtitle: 'Severe monsoon fog creates critical safety and productivity challenges for India\'s largest iron ore producer', video_title: '🎬 AI Video Fog Analyzer', video_subtitle: 'Upload a mine haul road video for real-time fog analysis, an enhanced view, and voice alerts.', upload_title: 'Drop Mine Haul Road Video Here', upload_desc: 'Supports MP4, WebM, MOV · Any resolution · Fog analysis runs frame-by-frame', upload_local: '💡 No camera needed · Processing happens locally in your browser.'
    },
    hi: {
      home_eyebrow: '🏭 एनएमडीसी · बैलाडीला लौह अयस्क खदान · एआई सुरक्षा प्रणाली', home_title_1: 'फॉगगार्ड', home_title_2: 'बुद्धिमत्ता', home_title_3: 'प्लेटफॉर्म', home_subtitle: 'बैलाडीला खदानों में कोहरा पहचानने और डंपर चालकों को सुरक्षित मार्गदर्शन देने वाला एआई सिस्टम।', home_btn_dashboard: '🖥️ कमांड सेंटर खोलें', home_btn_video: '🎬 वीडियो का विश्लेषण करें', stat_current: 'वर्तमान उत्पादन MTPA', stat_target: '2030 तक लक्ष्य MTPA', stat_visibility: 'कोहरे में न्यूनतम दृश्यता', stat_monsoon: 'प्रभावित मानसून महीने', stat_sensors: 'प्रति वाहन एआई सेंसर', challenge_label: 'चुनौती', challenge_title: 'बैलाडीला खदानों को फॉगगार्ड की आवश्यकता क्यों है', challenge_subtitle: 'घना मानसूनी कोहरा सुरक्षा और उत्पादन के लिए गंभीर चुनौती पैदा करता है', video_title: '🎬 एआई वीडियो कोहरा विश्लेषक', video_subtitle: 'रीयल-टाइम विश्लेषण और आवाज़ चेतावनी के लिए खदान का वीडियो अपलोड करें।', upload_title: 'खदान मार्ग का वीडियो यहां डालें', upload_desc: 'MP4, WebM, MOV · किसी भी रिज़ॉल्यूशन का वीडियो · फ्रेम-दर-फ्रेम विश्लेषण', upload_local: '💡 कैमरे की आवश्यकता नहीं · प्रक्रिया ब्राउज़र में स्थानीय रूप से होती है।'
    },
    te: {
      home_eyebrow: '🏭 NMDC · బైలాడిలా ఇనుప ఖనిజ గనులు · AI భద్రతా వ్యవస్థ', home_title_1: 'ఫాగ్‌గార్డ్', home_title_2: 'మేధస్సు', home_title_3: 'ప్లాట్‌ఫామ్', home_subtitle: 'బైలాడిలా గనుల్లో పొగమంచును గుర్తించి డంపర్ డ్రైవర్లకు సురక్షిత మార్గదర్శనం అందించే AI వ్యవస్థ.', home_btn_dashboard: '🖥️ కమాండ్ సెంటర్ తెరవండి', home_btn_video: '🎬 వీడియో విశ్లేషించండి', stat_current: 'ప్రస్తుత ఉత్పత్తి MTPA', stat_target: '2030 లక్ష్యం MTPA', stat_visibility: 'పొగమంచులో కనిష్ట దృశ్యమానత', stat_monsoon: 'ప్రభావిత వర్షాకాల నెలలు', stat_sensors: 'వాహనానికి AI సెన్సార్లు', challenge_label: 'సవాలు', challenge_title: 'బైలాడిలా గనులకు ఫాగ్‌గార్డ్ ఎందుకు అవసరం', challenge_subtitle: 'దట్టమైన వర్షాకాల పొగమంచు భద్రత మరియు ఉత్పత్తికి తీవ్రమైన సవాలును సృష్టిస్తుంది', video_title: '🎬 AI వీడియో పొగమంచు విశ్లేషకుడు', video_subtitle: 'నిజసమయ విశ్లేషణ మరియు వాయిస్ హెచ్చరికల కోసం గని వీడియోను అప్‌లోడ్ చేయండి.', upload_title: 'గని రహదారి వీడియోను ఇక్కడ ఉంచండి', upload_desc: 'MP4, WebM, MOV · ఏ రిజల్యూషన్ అయినా · ఫ్రేమ్-వారీ విశ్లేషణ', upload_local: '💡 కెమెరా అవసరం లేదు · ప్రక్రియ బ్రౌజర్‌లోనే జరుగుతుంది.'
    },
    kn: {
      home_eyebrow: '🏭 NMDC · ಬೈಲಾಡಿಲಾ ಕಬ್ಬಿಣದ ಅದಿರು ಗಣಿ · AI ಸುರಕ್ಷತಾ ವ್ಯವಸ್ಥೆ', home_title_1: 'ಫಾಗ್‌ಗಾರ್ಡ್', home_title_2: 'ಬುದ್ಧಿವಂತಿಕೆ', home_title_3: 'ವೇದಿಕೆ', home_subtitle: 'ಬೈಲಾಡಿಲಾ ಗಣಿಗಳಲ್ಲಿ ಮಂಜನ್ನು ಪತ್ತೆಹಚ್ಚಿ ಡಂಪರ್ ಚಾಲಕರಿಗೆ ಸುರಕ್ಷಿತ ಮಾರ್ಗದರ್ಶನ ನೀಡುವ AI ವ್ಯವಸ್ಥೆ.', home_btn_dashboard: '🖥️ ಕಮಾಂಡ್ ಸೆಂಟರ್ ತೆರೆಯಿರಿ', home_btn_video: '🎬 ವೀಡಿಯೊ ವಿಶ್ಲೇಷಿಸಿ', stat_current: 'ಪ್ರಸ್ತುತ ಉತ್ಪಾದನೆ MTPA', stat_target: '2030ರ ಗುರಿ MTPA', stat_visibility: 'ಮಂಜಿನಲ್ಲಿ ಕನಿಷ್ಠ ದೃಶ್ಯತೆ', stat_monsoon: 'ಪರಿಣಾಮಿತ ಮಳೆಗಾಲದ ತಿಂಗಳುಗಳು', stat_sensors: 'ಪ್ರತಿ ವಾಹನದ AI ಸೆನ್ಸರ್‌ಗಳು', challenge_label: 'ಸವಾಲು', challenge_title: 'ಬೈಲಾಡಿಲಾ ಗಣಿಗಳಿಗೆ ಫಾಗ್‌ಗಾರ್ಡ್ ಏಕೆ ಬೇಕು', challenge_subtitle: 'ದಟ್ಟ ಮಳೆಗಾಲದ ಮಂಜು ಸುರಕ್ಷತೆ ಮತ್ತು ಉತ್ಪಾದನೆಗೆ ಗಂಭೀರ ಸವಾಲಾಗಿದೆ', video_title: '🎬 AI ವೀಡಿಯೊ ಮಂಜು ವಿಶ್ಲೇಷಕ', video_subtitle: 'ನೈಜ-ಸಮಯದ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಧ್ವನಿ ಎಚ್ಚರಿಕೆಗಳಿಗಾಗಿ ಗಣಿ ವೀಡಿಯೊ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.', upload_title: 'ಗಣಿ ರಸ್ತೆ ವೀಡಿಯೊವನ್ನು ಇಲ್ಲಿ ಹಾಕಿ', upload_desc: 'MP4, WebM, MOV · ಯಾವುದೇ ರೆಸಲ್ಯೂಶನ್ · ಫ್ರೇಮ್-ವಾರಿ ವಿಶ್ಲೇಷಣೆ', upload_local: '💡 ಕ್ಯಾಮೆರಾ ಅಗತ್ಯವಿಲ್ಲ · ಪ್ರಕ್ರಿಯೆ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ನಡೆಯುತ್ತದೆ.'
    },
    ta: {
      home_eyebrow: '🏭 NMDC · பைலாடிலா இரும்புத் தாது சுரங்கம் · AI பாதுகாப்பு அமைப்பு', home_title_1: 'ஃபாக் கார்டு', home_title_2: 'நுண்ணறிவு', home_title_3: 'தளம்', home_subtitle: 'பைலாடிலா சுரங்கங்களில் பனிமூட்டத்தைக் கண்டறிந்து டம்பர் ஓட்டுநர்களுக்கு பாதுகாப்பான வழிகாட்டுதலை வழங்கும் AI அமைப்பு.', home_btn_dashboard: '🖥️ கட்டுப்பாட்டு மையத்தைத் திறக்கவும்', home_btn_video: '🎬 வீடியோவைப் பகுப்பாய்வு செய்யவும்', stat_current: 'தற்போதைய உற்பத்தி MTPA', stat_target: '2030 இலக்கு MTPA', stat_visibility: 'பனியில் குறைந்தபட்ச பார்வை', stat_monsoon: 'பாதிக்கப்பட்ட பருவமழை மாதங்கள்', stat_sensors: 'ஒரு வாகனத்திற்கான AI சென்சார்கள்', challenge_label: 'சவால்', challenge_title: 'பைலாடிலா சுரங்கங்களுக்கு ஃபாக் கார்டு ஏன் தேவை', challenge_subtitle: 'அடர்ந்த பருவமழை பனிமூட்டம் பாதுகாப்புக்கும் உற்பத்திக்கும் கடுமையான சவாலாக உள்ளது', video_title: '🎬 AI வீடியோ பனி பகுப்பாய்வி', video_subtitle: 'நேரலை பகுப்பாய்வு மற்றும் குரல் எச்சரிக்கைகளுக்காக சுரங்க வீடியோவைப் பதிவேற்றவும்.', upload_title: 'சுரங்க சாலை வீடியோவை இங்கே விடவும்', upload_desc: 'MP4, WebM, MOV · எந்தத் தீர்மானமும் · ஒவ்வொரு பிரேமும் பகுப்பாய்வு செய்யப்படும்', upload_local: '💡 கேமரா தேவையில்லை · செயலாக்கம் உலாவியிலேயே நடக்கும்.'
    }
  };

  Object.keys(pageCopy).forEach(lang => Object.assign(translations[lang], pageCopy[lang]));

  const operatorCopy = {
    en: { weather_title: 'Weather · Bailadila', weather_desc: 'Dense Fog · Monsoon', manual_fog: 'Manual Fog Control', fog_class_label: 'Fog Class', current_condition: 'Current Condition', active_vehicles: 'Active Vehicles', road_sectors: 'Road Sectors', fog_gauge: 'Fog Gauge' },
    hi: { weather_title: 'मौसम · बैलाडीला', weather_desc: 'घना कोहरा · मानसून', manual_fog: 'मैनुअल कोहरा नियंत्रण', fog_class_label: 'कोहरा श्रेणी', current_condition: 'वर्तमान स्थिति', active_vehicles: 'सक्रिय वाहन', road_sectors: 'सड़क क्षेत्र', fog_gauge: 'कोहरा गेज' },
    te: { weather_title: 'వాతావరణం · బైలాడిలా', weather_desc: 'దట్టమైన పొగమంచు · వర్షాకాలం', manual_fog: 'మాన్యువల్ పొగమంచు నియంత్రణ', fog_class_label: 'పొగమంచు స్థాయి', current_condition: 'ప్రస్తుత పరిస్థితి', active_vehicles: 'క్రియాశీల వాహనాలు', road_sectors: 'రహదారి విభాగాలు', fog_gauge: 'పొగమంచు గేజ్' },
    kn: { weather_title: 'ಹವಾಮಾನ · ಬೈಲಾಡಿಲಾ', weather_desc: 'ದಟ್ಟ ಮಂಜು · ಮಳೆಗಾಲ', manual_fog: 'ಹಸ್ತಚಾಲಿತ ಮಂಜು ನಿಯಂತ್ರಣ', fog_class_label: 'ಮಂಜಿನ ವರ್ಗ', current_condition: 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ', active_vehicles: 'ಸಕ್ರಿಯ ವಾಹನಗಳು', road_sectors: 'ರಸ್ತೆ ವಲಯಗಳು', fog_gauge: 'ಮಂಜು ಗೇಜ್' },
    ta: { weather_title: 'வானிலை · பைலாடிலா', weather_desc: 'அடர்ந்த பனி · பருவமழை', manual_fog: 'கைமுறை பனி கட்டுப்பாடு', fog_class_label: 'பனி வகை', current_condition: 'தற்போதைய நிலை', active_vehicles: 'செயலில் உள்ள வாகனங்கள்', road_sectors: 'சாலை பிரிவுகள்', fog_gauge: 'பனி அளவுகோல்' }
  };

  Object.keys(operatorCopy).forEach(lang => Object.assign(translations[lang], operatorCopy[lang]));

  function setLanguage(lang) {
    if (!translations[lang]) lang = 'en';
    currentLang = lang;
    localStorage.setItem('minesfe_lang', lang);
    document.documentElement.lang = lang;
    translatePage();
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  function getLanguage() { return currentLang; }

  function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || translations['en'][key] || key;
  }

  function translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = t(key);
      if (text) {
        if (el.tagName === 'INPUT' && el.type === 'button') el.value = text;
        else el.textContent = text;
      }
    });

    // Update language selector dropdown if present
    const langSelect = document.getElementById('langSelect');
    if (langSelect && langSelect.value !== currentLang) {
      langSelect.value = currentLang;
    }
  }

  function installLanguageControl() {
    const status = document.querySelector('.navbar-status');
    if (!status || document.getElementById('langSelect')) return;
    const wrapper = document.createElement('label');
    wrapper.className = 'language-control';
    wrapper.innerHTML = `<span data-i18n="language_label">Language</span><select id="langSelect" aria-label="Language"><option value="en">English</option><option value="hi">हिन्दी</option><option value="te">తెలుగు</option><option value="kn">ಕನ್ನಡ</option><option value="ta">தமிழ்</option></select>`;
    status.appendChild(wrapper);
    wrapper.querySelector('select').addEventListener('change', event => setLanguage(event.target.value));
  }

  function init() {
    installLanguageControl();
    document.documentElement.lang = currentLang;
    translatePage();
  }

  return { init, setLanguage, getLanguage, t, translatePage };
})();

window.I18n = I18n;
document.addEventListener('DOMContentLoaded', () => I18n.init());
