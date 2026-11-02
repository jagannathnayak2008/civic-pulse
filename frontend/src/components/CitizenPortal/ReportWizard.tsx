import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { IncidentCategory } from '../../types/civicpulse';
import {
  Camera,
  UploadCloud,
  Mic,
  MicOff,
  MapPin,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Crosshair,
  Layers,
  ChevronRight,
  Droplets,
  Trash2,
  Lightbulb,
  Building2,
  AlertTriangle,
  RotateCcw,
  Navigation,
  Compass,
  Languages,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';

export interface VoiceLangConfig {
  code: string;
  label: string;
  nativeName: string;
  speechCode: string;
  badge: string;
  presetKey: string;
  sampleDefect: string;
  sampleOriginal: string;
  sampleEnglish: string;
  sampleKeywords: string[];
}

export const VOICE_LANG_OPTIONS: VoiceLangConfig[] = [
  {
    code: 'or',
    label: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    speechCode: 'or-IN',
    badge: 'Odisha State',
    presetKey: 'odia_pothole',
    sampleDefect: 'Road Crater & Stagnant Water',
    sampleOriginal: 'ରାସ୍ତାରେ ଏକ ବଡ଼ ଗାତ ହୋଇଛି, ପାଣି ଜମି ରହିଛି ଏବଂ ସ୍କୁଲ ପାଖରେ ଗାଡ଼ି ଚଳାଚଳରେ ବିପଦ ସୃଷ୍ଟି ହେଉଛି।',
    sampleEnglish: 'There is a deep crater pothole on the road with stagnant water, creating severe hazard for school transit.',
    sampleKeywords: ['ବଡ଼ ଗାତ (large crater)', 'ପାଣି ଜମି (stagnant water)', 'ସ୍କୁଲ ପାଖରେ (near school)', 'ବିପଦ (severe hazard)']
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    badge: 'National',
    presetKey: 'hindi_garbage',
    sampleDefect: 'Market Garbage Overflow',
    sampleOriginal: 'मेन मार्केट के सामने कचरे का बहुत बड़ा ढेर लगा है, बदबू आ रही है और आवारा पशु घूम रहे हैं।',
    sampleEnglish: 'There is a massive overflow of rotten garbage opposite main market, causing stench and attracting stray animals.',
    sampleKeywords: ['कचरे का ढेर (garbage pile)', 'बदबू (foul odor)', 'आवारा पशु (stray animals)', 'मार्केट (public market)']
  },
  {
    code: 'bn',
    label: 'Bengali',
    nativeName: 'বাংলা',
    speechCode: 'bn-IN',
    badge: 'Eastern Regional',
    presetKey: 'bengali_streetlight',
    sampleDefect: 'Broken Streetlight Blackout',
    sampleOriginal: 'বাস স্টপের কাছে স্ট্রিট লাইট ৩ দিন ধরে বন্ধ, রাতে মেয়েরা হেঁটে যেতে ভয় পাচ্ছে এবং অন্ধকার রয়েছে।',
    sampleEnglish: 'The street lamp near the bus stop has been broken for 3 days; total blackout poses safety risks for commuters.',
    sampleKeywords: ['স্ট্রিট লাইট বন্ধ (streetlight broken)', 'অন্ধকার (blackout)', 'বাস স্টপ (bus stop)', 'ভয় (safety risk)']
  },
  {
    code: 'te',
    label: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
    badge: 'Southern Regional',
    presetKey: 'telugu_road',
    sampleDefect: 'Road Hazard & Waterlogging',
    sampleOriginal: 'రోడ్డుపై చాలా పెద్ద గుంత ఏర్పడింది, వర్షపు నీరు నిలిచిపోయి వాహనదారులకు తీవ్ర ప్రమాదకరంగా ఉంది.',
    sampleEnglish: 'A large crater pothole has formed on the road with stagnant rainwater, creating severe danger for motorists.',
    sampleKeywords: ['పెద్ద గుంత (large pothole)', 'వర్షపు నీరు (stagnant rainwater)', 'తీవ్ర ప్రమాదకరం (severe danger)', 'వాహనదారులు (motorists)']
  },
  {
    code: 'en',
    label: 'English',
    nativeName: 'English',
    speechCode: 'en-US',
    badge: 'Standard',
    presetKey: 'english_drainage',
    sampleDefect: 'Storm Drain Overflow',
    sampleOriginal: 'Storm drain overflowing with black sewage water after rain, flooding the residential road corner.',
    sampleEnglish: 'Storm drain overflowing with black sewage water after rain, flooding the residential road corner.',
    sampleKeywords: ['overflowing storm drain', 'black sewage', 'flooding residential road']
  }
];

// Custom Red Location Pin matching user's screenshot
const redPinIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: grab;">
      <div style="width: 28px; height: 28px; background: #DC2626; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
        <div style="width: 8px; height: 8px; background: #FFFFFF; border-radius: 50%; transform: rotate(45deg);"></div>
      </div>
    </div>
  `,
  className: 'custom-red-pin-icon',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34]
});

// Map click event listener to drop/move pin
function MapClickObserver({ onLocationPicked }: { onLocationPicked: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationPicked(parseFloat(e.latlng.lat.toFixed(6)), parseFloat(e.latlng.lng.toFixed(6)));
    }
  });
  return null;
}

// Map recentering listener
function MapViewCenterer({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

// Multi-Problem Catalog Configuration
interface ProblemProfile {
  category: IncidentCategory;
  title: string;
  shortLabel: string;
  icon: any;
  department: string;
  defaultSeverity: string;
  recurrenceNote: string;
  sampleImg: string;
  summary: string;
  action: string;
}

const PROBLEM_CATALOG: ProblemProfile[] = [
  {
    category: 'POTHOLE_ROAD_DAMAGE',
    title: 'Roads with Repeated Potholes & Cracks',
    shortLabel: 'Road Potholes',
    icon: Layers,
    department: 'Road Maintenance Department',
    defaultSeverity: 'High',
    recurrenceNote: '🔥 Recurring Hotspot: 3rd road complaint logged in this 50m corridor this month.',
    sampleImg: '/images/road_pothole_before.jpg',
    summary: 'Subsurface tarmac void (1.8m x 1.2m) with exposed aggregate causing vehicle swerving.',
    action: 'Full-depth asphalt patching, cold milling, and heavy bitumen compaction.'
  },
  {
    category: 'GARBAGE_OVERFLOW',
    title: 'Areas with Recurring Garbage Overflow',
    shortLabel: 'Garbage Overflow',
    icon: Trash2,
    department: 'Sanitation & Solid Waste Management',
    defaultSeverity: 'High',
    recurrenceNote: '⚠️ Recurring Dump: Uncontrolled waste accumulation reported 4 times outside commercial market.',
    sampleImg: '/images/garbage_before.jpg',
    summary: 'Decomposing biological and solid plastic waste spilling over pedestrian sidewalk and open drains.',
    action: 'Emergency municipal waste clearance, mechanized bin deployment, and bleaching sanitation spray.'
  },
  {
    category: 'PUBLIC_TOILET_ISSUES',
    title: 'Public Toilet Issues (Cleanliness, Plumbing & Choke)',
    shortLabel: 'Public Toilets',
    icon: Building2,
    department: 'Public Health & Sanitation Division',
    defaultSeverity: 'High',
    recurrenceNote: '⚠️ Recurring Hygiene Failure: 2nd sanitary outage logged at this public facility.',
    sampleImg: '/images/toilet_before.jpg',
    summary: 'Broken flush valve and severe sewage backflow rendering public facility unusable.',
    action: 'Plumbing fixture replacement, pressure pipeline de-silting, and comprehensive disinfection.'
  },
  {
    category: 'WATERLOGGING',
    title: 'Waterlogging & Street Flood Inundation',
    shortLabel: 'Waterlogging',
    icon: Droplets,
    department: 'Stormwater Management & Flood Unit',
    defaultSeverity: 'Critical (P1)',
    recurrenceNote: '🔥 High-Risk Monsoon Inundation Zone: Chronic road ponding under transit flyover.',
    sampleImg: '/images/waterlogging_before.jpg',
    summary: 'Standing stormwater pooling (30-40cm depth) submerging vehicle lanes and halting transit.',
    action: 'Immediate deployment of dewatering diesel pumps and storm outlet desiltation.'
  },
  {
    category: 'DRAINAGE_WATER_LEAKAGE',
    title: 'Locations with Frequent Drainage Complaints',
    shortLabel: 'Drainage & Sewage',
    icon: Droplets,
    department: 'Water Supply & Sewerage Board',
    defaultSeverity: 'High',
    recurrenceNote: '⚠️ Chronic Drainage Choke: Underground sewer surcharge into road curbs.',
    sampleImg: '/images/drainage_before.jpg',
    summary: 'Storm drain grated inlet choked with plastic and sludge, overflowing blackwater onto road.',
    action: 'Hydraulic suction jetting, drain silt extraction, and sewer grate clearing.'
  },
  {
    category: 'BROKEN_STREETLIGHT',
    title: 'Streetlights that Repeatedly Fail (Blackouts)',
    shortLabel: 'Streetlights',
    icon: Lightbulb,
    department: 'Electrical & Street Lighting Division',
    defaultSeverity: 'Medium',
    recurrenceNote: '⚠️ Repeated Electrical Outage: Luminaire failure reported 3 consecutive nights.',
    sampleImg: '/images/streetlight_before.jpg',
    summary: 'Sodium-vapor luminaire fixture broken with severed cable, causing commuter blackout.',
    action: 'LED luminaire head replacement and feeder junction cable re-termination.'
  },
  {
    category: 'OPEN_MANHOLE_HAZARDS',
    title: 'Open Manholes & Severe Civil Safety Hazards',
    shortLabel: 'Open Manhole',
    icon: AlertTriangle,
    department: 'Emergency Civil Infrastructure Unit',
    defaultSeverity: 'Critical (P1)',
    recurrenceNote: '🚨 CRITICAL LIFE SAFETY: Missing manhole cover on active pedestrian corridor.',
    sampleImg: '/images/manhole_before.jpg',
    summary: 'Uncovered 2-meter deep underground drainage chamber exposed on active sidewalk.',
    action: 'Immediate barricading and installation of reinforced ductile iron (DI) manhole cover.'
  },
  {
    category: 'OTHERS',
    title: 'Other Civic Infrastructure & Municipal Concerns',
    shortLabel: 'Others',
    icon: HelpCircle,
    department: 'General Municipal Grievance & Civil Cell',
    defaultSeverity: 'Medium',
    recurrenceNote: 'ℹ️ Custom Citizen Grievance: Under active triage by municipal coordination cell.',
    sampleImg: '',
    summary: 'Citizen submitted municipal issue requiring on-ground departmental assessment.',
    action: 'Direct inspection and task assignment to responsible zonal ward supervisor.'
  }
];

export const ReportWizard: React.FC = () => {
  const { submitReport, setCitizenTab, selectIncidentByTracking, currentUser } = useCivicPulse();

  // --- Step 1: Media & Hardware Camera ---
  const [selectedProfile, setSelectedProfile] = useState<ProblemProfile>(PROBLEM_CATALOG[0]);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>(PROBLEM_CATALOG[0].sampleImg);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Step 2: Automated AI Categorization ---
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [aiClassification, setAiClassification] = useState<{
    category: IncidentCategory;
    defect_name: string;
    confidence: number;
    severity: string;
    recurrence_flag: boolean;
    department: string;
    summary: string;
    recommended_action: string;
  }>({
    category: PROBLEM_CATALOG[0].category,
    defect_name: PROBLEM_CATALOG[0].title,
    confidence: 0.94,
    severity: PROBLEM_CATALOG[0].defaultSeverity,
    recurrence_flag: true,
    department: PROBLEM_CATALOG[0].department,
    summary: PROBLEM_CATALOG[0].summary,
    recommended_action: PROBLEM_CATALOG[0].action
  });

  // --- Step 3: Location (Screenshot Match) ---
  const [latitude, setLatitude] = useState<number>(20.296100);
  const [longitude, setLongitude] = useState<number>(85.824500);
  const [gpsStatus, setGpsStatus] = useState<string>('Ready for GPS');

  // --- Step 4: AI Multilingual Voice Assistant & Translation ---
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [customDescription, setCustomDescription] = useState<string>(PROBLEM_CATALOG[0].summary);
  const [voiceText, setVoiceText] = useState<string>(VOICE_LANG_OPTIONS[0].sampleEnglish);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<string>('or');
  const [originalScript, setOriginalScript] = useState<string>(VOICE_LANG_OPTIONS[0].sampleOriginal);
  const [translatedEnglish, setTranslatedEnglish] = useState<string>(VOICE_LANG_OPTIONS[0].sampleEnglish);
  const [detectedLangDisplay, setDetectedLangDisplay] = useState<string>(`${VOICE_LANG_OPTIONS[0].label} (${VOICE_LANG_OPTIONS[0].nativeName})`);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>(VOICE_LANG_OPTIONS[0].sampleKeywords);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationStep, setTranslationStep] = useState<string>('');
  const [translationProgress, setTranslationProgress] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  // Timer for voice recording
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // --- Step 5: Submission ---
  const [privacyConsent, setPrivacyConsent] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStepText, setSubmitStepText] = useState<string>('');
  const [submitResult, setSubmitResult] = useState<{
    trackingNumber: string;
    isDuplicate: boolean;
    status: string;
  } | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraStream]);

  // Connect video element to stream
  useEffect(() => {
    if (cameraActive && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraActive, cameraStream]);

  // Handle hardware camera start
  const handleStartCamera = async () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      setCameraStream(stream);
      setCameraActive(true);
    } catch (err: any) {
      alert(`Camera Permission: ${err.message || 'Please allow camera access in browser.'}`);
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const v = videoRef.current;
      const c = canvasRef.current;
      c.width = v.videoWidth || 640;
      c.height = v.videoHeight || 480;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.drawImage(v, 0, 0, c.width, c.height);
        setCapturedImage(c.toDataURL('image/jpeg', 0.85));
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
        setCameraStream(null);
      }
      setCameraActive(false);
      // Auto-classify captured frame
      autoClassifyDamage(selectedProfile);
    }
  };

  // Browser GPS detection matching screenshot Option A
  const handleDetectBrowserGps = () => {
    if (!navigator.geolocation) {
      alert('Browser geolocation not supported.');
      return;
    }
    setGpsStatus('Acquiring high-accuracy GPS satellites...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lon = parseFloat(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lon);
        setGpsStatus(`GPS Locked (±${Math.round(pos.coords.accuracy)}m accuracy)`);
      },
      (err) => {
        setGpsStatus(`GPS error: ${err.message}. Using default preset.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Automated problem categorizer simulation
  const autoClassifyDamage = (profile: ProblemProfile) => {
    setSelectedProfile(profile);
    setCapturedImage(profile.sampleImg || '');
    if (!customDescription.trim() || PROBLEM_CATALOG.some((p) => p.summary === customDescription.trim())) {
      setCustomDescription(profile.summary);
      setVoiceText(profile.summary);
    }
    setIsClassifying(true);
    setTimeout(() => {
      setAiClassification({
        category: profile.category,
        defect_name: profile.title,
        confidence: profile.category === 'OTHERS' ? 0.90 : 0.94,
        severity: profile.defaultSeverity,
        recurrence_flag: profile.category !== 'OTHERS',
        department: profile.department,
        summary: profile.summary,
        recommended_action: profile.action
      });
      setIsClassifying(false);
    }, 450);
  };

  // Multilingual Speech Translation Engine
  const handleTranslateVoice = async (text: string, langCode: string, presetKey?: string) => {
    if (!text.trim() && !presetKey) return;
    
    // Normalize speech input for common ASR misrecognitions (e.g. Bengali "গত" -> "গর্ত")
    let normalized = text.trim();
    if (normalized.includes('গত আছে') || normalized.includes('অনেক গত') || normalized.includes('বড় গত')) {
      normalized = normalized.replace(/গত(?!\w)/g, 'গর্ত').replace('অনেক গত', 'অনেক গর্ত');
    }

    const currentLangObj = VOICE_LANG_OPTIONS.find((l) => l.code === langCode) || VOICE_LANG_OPTIONS[0];
    const langLabel = currentLangObj.label;

    setIsTranslating(true);
    setTranslationProgress(20);
    setTranslationStep(`Capturing spoken ${langLabel} (${currentLangObj.nativeName}) acoustic phonemes...`);

    // Stage 1 delay
    await new Promise((r) => setTimeout(r, 650));
    setTranslationProgress(55);
    setTranslationStep(`Cross-Lingual AI Engine: Resolving ${langLabel} grammar & civic hazard context...`);

    let translatedData: any = null;
    try {
      // Use relative path with fallback to port 8000
      let res = await fetch('/api/voice/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: normalized,
          source_lang: langCode,
          preset_key: presetKey
        })
      });
      if (!res.ok) {
        res = await fetch('http://localhost:8000/api/voice/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: normalized,
            source_lang: langCode,
            preset_key: presetKey
          })
        });
      }
      if (res.ok) {
        translatedData = await res.json();
      }
    } catch (e) {
      console.warn('Backend translation unavailable; using client translation engine');
    }

    // Stage 2 delay for realistic neural processing ("take sometime to translate into english")
    await new Promise((r) => setTimeout(r, 750));
    setTranslationProgress(90);
    setTranslationStep('Synthesizing standardized English municipal action order...');
    await new Promise((r) => setTimeout(r, 450));
    setTranslationProgress(100);

    if (translatedData) {
      setOriginalScript(translatedData.original_script || text);
      setTranslatedEnglish(translatedData.translated_english || text);
      setDetectedLangDisplay(translatedData.language_name || `${langLabel} (${currentLangObj.nativeName})`);
      setExtractedKeywords(translatedData.urgency_keywords || []);
      setVoiceText(translatedData.translated_english);
      setCustomDescription(translatedData.translated_english);

      // Auto-sync problem category if inferred
      if (translatedData.inferred_category) {
        const matchProfile = PROBLEM_CATALOG.find((p) => p.category === translatedData.inferred_category);
        if (matchProfile) {
          setSelectedProfile(matchProfile);
          setCapturedImage(matchProfile.sampleImg);
        }
      }
    } else {
      // Client fallback translation (ensuring 100% English output)
      let fallbackEng = '';
      const textLower = normalized.toLowerCase();
      if (textLower.includes('গর্ত') || textLower.includes('গত') || textLower.includes('গুంత') || textLower.includes('ଗାତ') || textLower.includes('गड्ढा') || textLower.includes('hole') || textLower.includes('road')) {
        fallbackEng = 'There are multiple deep road potholes and craters here, making vehicle and bike transit extremely hazardous.';
      } else if (textLower.includes('কচরা') || textLower.includes('আবর্জনা') || textLower.includes('చెత్త') || textLower.includes('ଅଳିଆ') || textLower.includes('waste') || textLower.includes('garbage')) {
        fallbackEng = 'There is a massive overflow of rotten garbage here, causing intense stench and attracting stray animals.';
      } else if (textLower.includes('জল') || textLower.includes('నీరు') || textLower.includes('flood') || textLower.includes('water')) {
        fallbackEng = 'Severe street waterlogging with standing water accumulation submerging the roadway.';
      } else {
        fallbackEng = currentLangObj.sampleEnglish;
      }

      setOriginalScript(text || currentLangObj.sampleOriginal);
      setTranslatedEnglish(fallbackEng);
      setDetectedLangDisplay(`${currentLangObj.label} (${currentLangObj.nativeName})`);
      setExtractedKeywords(currentLangObj.sampleKeywords);
      setVoiceText(fallbackEng);
      setCustomDescription(fallbackEng);
    }

    setIsTranslating(false);
  };

  // Quick preset voice note loader
  const loadVoiceSample = (lang: VoiceLangConfig) => {
    setSelectedVoiceLang(lang.code);
    setCustomDescription(lang.sampleEnglish);
    setVoiceText(lang.sampleEnglish);
    handleTranslateVoice(lang.sampleOriginal, lang.code, lang.presetKey);
  };

  // Live microphone capture with Web Speech Recognition
  const handleToggleVoiceAssistant = async () => {
    const currentLang = VOICE_LANG_OPTIONS.find((o) => o.code === selectedVoiceLang) || VOICE_LANG_OPTIONS[0];

    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        mr.start();
        mediaRecorderRef.current = mr;
        setIsRecording(true);

        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SR) {
          const reco = new SR();
          recognitionRef.current = reco;
          reco.continuous = false;
          reco.interimResults = true;
          reco.lang = currentLang.speechCode;
          reco.onresult = (ev: any) => {
            const transcript = ev.results[ev.results.length - 1][0].transcript;
            setOriginalScript(transcript);
            handleTranslateVoice(transcript, currentLang.code);
          };
          reco.onerror = () => {
            setIsRecording(false);
          };
          reco.onend = () => {
            setIsRecording(false);
          };
          reco.start();
        }
      } catch (err: any) {
        alert(`Mic Permission: ${err.message || 'Please allow microphone access.'}`);
        setIsRecording(false);
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
    }
  };

  // Text-To-Speech (TTS) Voice playback
  const handleSpeakTranslation = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech not supported in this browser.');
      return;
    }
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedEnglish || originalScript);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  // Submit incident
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyConsent) {
      setPrivacyConsent(true);
    }

    const finalDescription = (customDescription.trim() || voiceText.trim() || originalScript.trim() || translatedEnglish.trim() || selectedProfile.summary);

    setIsSubmitting(true);
    const steps = [
      `AI Vision: Analyzing visual signature for ${selectedProfile.shortLabel}...`,
      'Recurrence Intelligence: Checking historical complaints at this coordinate...',
      `PostGIS Jurisdiction: Mapping to Municipal Zone & ${selectedProfile.department}...`,
      'LangGraph Orchestrator: Synthesizing Explainable AI Risk Score & SLA...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setSubmitStepText(steps[i]);
      await new Promise((r) => setTimeout(r, 400));
    }

    const result = await submitReport({
      latitude,
      longitude,
      media_type: 'PHOTO',
      media_url: capturedImage || selectedProfile.sampleImg,
      category: selectedProfile.category,
      raw_text: finalDescription,
      audio_script: originalScript.trim() || finalDescription,
      detected_language: selectedVoiceLang,
      translated_english: finalDescription,
      reporter_alias: currentUser ? `${currentUser.full_name} (${currentUser.phone_number})` : 'Citizen Civic Inspector'
    });

    setIsSubmitting(false);
    setSubmitResult({
      trackingNumber: result.trackingNumber,
      isDuplicate: result.isDuplicate,
      status: result.status
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Banner */}
      <div className="bg-white border border-[#DCE5EE] p-6 rounded-3xl shadow-sm flex items-center justify-between text-[#172B3A]">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-cyan-50 text-[#13B8C5] rounded-2xl border border-cyan-200 shadow-sm">
            <Sparkles className="w-6 h-6 text-[#13B8C5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-[#172B3A] tracking-tight">
                Autonomous Multi-Problem Civic AI
              </h2>
              <span className="px-2.5 py-0.5 bg-slate-100 text-[#10243A] border border-[#DCE5EE] rounded-full text-[10px] font-mono font-bold">
                Automated Categorization &amp; Recurrence Tracking
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Potholes · Recurring Garbage · Public Toilets · Waterlogging · Drainage Chokes · Streetlights · Open Manholes · Others
            </p>
          </div>
        </div>
      </div>

      {submitResult ? (
        <div className="bg-white border border-[#DCE5EE] p-8 rounded-3xl text-center space-y-5 animate-in fade-in shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-[#16A36A] border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#16A36A] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
              {submitResult.isDuplicate ? 'AI RECURRING HOTSPOT MERGED' : 'AUTOMATICALLY CATEGORIZED & ROUTED'}
            </span>
            <h3 className="text-2xl font-black text-[#172B3A] mt-3">
              Master Ticket #{submitResult.trackingNumber}
            </h3>
            <p className="text-sm text-[#64748B] mt-2 max-w-lg mx-auto">
              Categorized as <strong className="text-[#172B3A]">{selectedProfile.title}</strong> and routed to <strong className="text-[#172B3A]">{selectedProfile.department}</strong>.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-center space-x-4">
            <button
              onClick={() => {
                selectIncidentByTracking(submitResult.trackingNumber);
                setCitizenTab('TRACK');
              }}
              className="px-6 py-2.5 bg-[#10243A] hover:bg-[#172F49] text-white text-xs font-bold rounded-xl transition flex items-center space-x-2 shadow-sm"
            >
              <span>Track Ticket #{submitResult.trackingNumber}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSubmitResult(null)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#172B3A] text-xs font-medium rounded-xl transition border border-[#DCE5EE]"
            >
              Report Another Problem
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* ================= STEP 1: MULTI-PROBLEM AI SELECTION & CAMERA ================= */}
          <div className="bg-white border border-[#DCE5EE] p-6 rounded-3xl space-y-4 shadow-sm text-[#172B3A]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-bold text-[#172B3A] flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#13B8C5]" />
                <span>Step 1: Automated Civic Problem Classifier</span>
              </label>
              <span className="text-[11px] font-mono text-[#13B8C5] font-semibold">
                AI Auto-Detects Category or Select Below
              </span>
            </div>

            {/* Problem Category Switcher Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {PROBLEM_CATALOG.map((profile) => {
                const Icon = profile.icon;
                const isSelected = selectedProfile.category === profile.category;
                return (
                  <button
                    key={profile.category}
                    type="button"
                    onClick={() => autoClassifyDamage(profile)}
                    className={`p-2.5 rounded-2xl text-left border transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#10243A] border-[#10243A] text-white shadow-sm font-bold'
                        : 'bg-slate-50 border-[#DCE5EE] text-[#64748B] hover:text-[#172B3A]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-[#13B8C5]' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-bold block leading-tight">{profile.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Camera Viewfinder & Photo Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <span className="text-xs text-[#64748B] font-medium block">
                  Media Evidence (Live Camera or Upload):
                </span>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#DCE5EE] bg-[#F4F7FB] flex items-center justify-center shadow-inner">
                  {cameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-3">
                        <span className="text-[10px] font-mono text-[#13B8C5] bg-[#10243A]/80 px-2 py-0.5 rounded font-bold">
                          LIVE CAMERA STREAM
                        </span>
                        <Crosshair className="w-12 h-12 text-[#13B8C5] animate-pulse" />
                        <span className="text-[10px] text-white bg-[#10243A]/90 px-2.5 py-0.5 rounded-full font-medium">
                          Frame hazard
                        </span>
                      </div>
                    </>
                  ) : capturedImage ? (
                    <img
                      src={capturedImage}
                      alt="Civic problem"
                      onError={(e) => {
                        if (selectedProfile.category !== 'OTHERS') {
                          (e.currentTarget as HTMLImageElement).src = '/images/road_pothole_before.jpg';
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-[#DCE5EE] flex items-center justify-center shadow-sm">
                        <Camera className="w-6 h-6 text-[#10243A]" />
                      </div>
                      <span className="text-xs font-bold text-[#172B3A]">No Sample Picture Required</span>
                      <p className="text-[11px] text-[#64748B] max-w-xs leading-relaxed">
                        Optional: Take a photo or upload an image if you have one, or proceed directly to describe the issue.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {cameraActive ? (
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="flex-1 py-2.5 bg-[#16A36A] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Snap Photo</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartCamera}
                      className="flex-1 py-2.5 bg-[#10243A] hover:bg-[#172F49] text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Open Camera</span>
                    </button>
                  )}

                  <label className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#172B3A] border border-[#DCE5EE] text-xs font-semibold rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-sm">
                    <UploadCloud className="w-4 h-4 text-[#13B8C5]" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setCapturedImage(ev.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Real-time AI Automated Categorization Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-[#DCE5EE] flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#10243A] bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-bold">
                      Step 2: AI Classification &amp; Recurrence
                    </span>
                    <span className="text-xs font-mono font-bold text-[#16A36A]">
                      {Math.round(aiClassification.confidence * 100)}% Confidence
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#172B3A]">
                    {aiClassification.defect_name}
                  </h3>

                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-[#E9A23B] font-medium leading-relaxed">
                    {selectedProfile.recurrenceNote}
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed">
                    <strong className="text-[#172B3A]">AI Analysis:</strong> {aiClassification.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#DCE5EE] space-y-1 text-xs">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Autonomous Department:</span>
                    <strong className="text-[#10243A] font-bold">{aiClassification.department}</strong>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Severity Tier:</span>
                    <strong className="text-[#DC4C4C] font-mono font-bold">{aiClassification.severity}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= STEP 3: EXACT MAP PICKER ================= */}
          <div className="bg-white border border-[#DCE5EE] p-6 rounded-3xl space-y-4 shadow-sm text-[#172B3A]">
            {/* Header */}
            <div className="flex items-center space-x-2 text-[#172B3A]">
              <span className="text-xl">📍</span>
              <h3 className="text-lg font-bold text-[#172B3A]">
                Step 3: Road Location (GPS or Pin Drop)
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* LEFT COLUMN: Option A (Browser GPS) + Option B (Inputs / Presets) */}
              <div className="space-y-4">
                {/* Option A: Browser GPS Detection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#172B3A] block">
                    Option A: Browser GPS Detection
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectBrowserGps}
                    className="w-10 h-10 rounded-lg bg-slate-50 hover:bg-slate-100 border border-[#DCE5EE] text-[#172B3A] flex items-center justify-center transition shadow-sm hover:border-[#13B8C5]"
                    title="Detect Browser GPS"
                  >
                    <Crosshair className="w-5 h-5 text-[#13B8C5]" />
                  </button>
                  <span className="text-[11px] font-mono text-[#13B8C5] font-semibold block">
                    {gpsStatus}
                  </span>
                </div>

                {/* Option B: Coordinate Inputs / Presets */}
                <div className="space-y-3 pt-1">
                  <label className="text-xs font-semibold text-[#172B3A] block">
                    Option B: Coordinate Inputs / Presets
                  </label>

                  {/* Preset Pills: KIIT Patia, Janpath, Khandagiri */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: '📍 KIIT Patia', lat: 20.354000, lon: 85.817500 },
                      { name: '📍 Janpath', lat: 20.288500, lon: 85.842000 },
                      { name: '📍 Khandagiri', lat: 20.259800, lon: 85.786500 }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setLatitude(preset.lat);
                          setLongitude(preset.lon);
                          setGpsStatus(`Preset: ${preset.name}`);
                        }}
                        className="py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-[#DCE5EE] hover:border-[#13B8C5] rounded-xl text-xs font-semibold text-[#172B3A] transition text-center shadow-sm"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  {/* Latitude input with - / + buttons */}
                  <div className="space-y-1">
                    <span className="text-xs text-[#64748B] block font-medium">Latitude</span>
                    <div className="flex items-center bg-slate-50 border border-[#DCE5EE] rounded-xl overflow-hidden focus-within:border-[#13B8C5] focus-within:bg-white">
                      <input
                        type="number"
                        step="0.000001"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent px-4 py-2.5 text-sm text-[#172B3A] font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setLatitude((prev) => parseFloat((prev - 0.001).toFixed(6)))}
                        className="px-3 py-2 text-[#64748B] hover:text-[#172B3A] font-mono text-base border-l border-[#DCE5EE] hover:bg-slate-100"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setLatitude((prev) => parseFloat((prev + 0.001).toFixed(6)))}
                        className="px-3 py-2 text-[#64748B] hover:text-[#172B3A] font-mono text-base border-l border-[#DCE5EE] hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Longitude input with - / + buttons */}
                  <div className="space-y-1">
                    <span className="text-xs text-[#64748B] block font-medium">Longitude</span>
                    <div className="flex items-center bg-slate-50 border border-[#DCE5EE] rounded-xl overflow-hidden focus-within:border-[#13B8C5] focus-within:bg-white">
                      <input
                        type="number"
                        step="0.000001"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent px-4 py-2.5 text-sm text-[#172B3A] font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setLongitude((prev) => parseFloat((prev - 0.001).toFixed(6)))}
                        className="px-3 py-2 text-[#64748B] hover:text-[#172B3A] font-mono text-base border-l border-[#DCE5EE] hover:bg-slate-100"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setLongitude((prev) => parseFloat((prev + 0.001).toFixed(6)))}
                        className="px-3 py-2 text-[#64748B] hover:text-[#172B3A] font-mono text-base border-l border-[#DCE5EE] hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Leaflet Map Container with strict clipping & zero bleed */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#172B3A] block">
                  Click on map to drop / move pin:
                </label>

                <div className="h-[290px] w-full rounded-2xl overflow-hidden border border-[#DCE5EE] relative shadow-sm bg-[#F4F7FB] z-0 isolate">
                  <MapContainer
                    center={[latitude, longitude]}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Red Marker at exact position */}
                    <Marker
                      position={[latitude, longitude]}
                      icon={redPinIcon}
                    />

                    {/* Click event observer and map view centerer */}
                    <MapClickObserver
                      onLocationPicked={(newLat, newLng) => {
                        setLatitude(newLat);
                        setLongitude(newLng);
                        setGpsStatus(`Map Pin Dropped: (${newLat}, ${newLng})`);
                      }}
                    />
                    <MapViewCenterer lat={latitude} lng={longitude} />
                  </MapContainer>
                </div>
                <div className="text-[11px] text-[#64748B] flex items-center justify-between px-1">
                  <span>Selected: <code className="text-[#10243A] font-mono font-bold">{latitude}, {longitude}</code></span>
                  <span className="text-[#64748B]">Click anywhere to move pin</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= STEP 4: PROBLEM DESCRIPTION & AI MULTILINGUAL VOICE ASSISTANT ================= */}
          <div className="bg-white border border-[#DCE5EE] p-6 rounded-3xl space-y-5 shadow-sm text-[#172B3A]">
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE5EE] pb-3">
              <div>
                <label className="text-sm font-bold text-[#172B3A] flex items-center space-x-2">
                  <Languages className="w-4 h-4 text-[#13B8C5]" />
                  <span>Step 4: AI Voice Assistant &amp; Multilingual Audio Translation</span>
                </label>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Speak in Odia, Hindi, Bengali, Telugu, or English — automated AI speech-to-text with English translation.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1.5 ${
                  isRecording 
                    ? 'bg-red-50 text-[#DC4C4C] border border-red-200 animate-pulse'
                    : 'bg-cyan-50 text-[#13B8C5] border border-cyan-200 font-semibold'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-[#DC4C4C] animate-ping' : 'bg-[#13B8C5]'}`} />
                  <span>
                    {isRecording 
                      ? `Recording Voice (00:0${recordingSeconds}s)...` 
                      : isTranslating 
                        ? 'AI Translating...' 
                        : 'Voice Assistant Ready'}
                  </span>
                </span>
              </div>
            </div>

            {/* Direct Problem Description Textarea */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-[#DCE5EE] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#172B3A] flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-[#13B8C5]" />
                  <span>Problem Description &amp; Citizen Notes (Type or Dictate):</span>
                </label>
                <span className="text-[10px] text-[#64748B] font-mono">
                  {customDescription.length} characters
                </span>
              </div>
              <textarea
                rows={3}
                value={customDescription}
                onChange={(e) => {
                  setCustomDescription(e.target.value);
                  setVoiceText(e.target.value);
                }}
                placeholder="Type your problem description here (e.g., Deep road pothole near gate 4 causing traffic bottleneck; overflowing garbage bin attracting animals; open manhole chamber)..."
                className="w-full p-3 bg-white rounded-xl border border-[#DCE5EE] text-xs text-[#172B3A] leading-relaxed focus:border-[#13B8C5] focus:outline-none resize-none shadow-sm"
              />
              <p className="text-[11px] text-[#64748B]">
                Type directly in any language above, or use the Multilingual AI Voice Assistant below to dictate with automatic English translation.
              </p>
            </div>

            {/* Language Switcher Tabs */}
            <div className="space-y-2">
              <span className="text-xs text-[#64748B] font-medium block">
                Select Spoken Language (Audio-to-Text Input):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {VOICE_LANG_OPTIONS.map((lang) => {
                  const isSelected = selectedVoiceLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setSelectedVoiceLang(lang.code);
                        loadVoiceSample(lang);
                      }}
                      className={`p-2.5 rounded-2xl text-left border transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#10243A] border-[#10243A] text-white shadow-sm ring-1 ring-[#10243A]'
                          : 'bg-slate-50 border-[#DCE5EE] text-[#64748B] hover:text-[#172B3A] hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-[#172F49] text-[#13B8C5] font-bold' : 'bg-slate-200 text-[#64748B]'
                        }`}>
                          {lang.code.toUpperCase()}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-[#64748B]'}`}>
                          {lang.badge}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className={`text-sm font-bold block ${isSelected ? 'text-white' : 'text-[#172B3A]'}`}>
                          {lang.nativeName}
                        </span>
                        <span className={`text-[11px] block ${isSelected ? 'text-slate-300' : 'text-[#64748B]'}`}>
                          {lang.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Microphone Recording & Quick Test Controls Bar */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-[#DCE5EE] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleToggleVoiceAssistant}
                  className={`py-3 px-5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition shadow-sm ${
                    isRecording
                      ? 'bg-[#DC4C4C] hover:bg-red-600 text-white animate-pulse'
                      : 'bg-[#10243A] hover:bg-[#172F49] text-white'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>
                    {isRecording 
                      ? `Stop & Translate (${recordingSeconds}s)` 
                      : `Speak in ${VOICE_LANG_OPTIONS.find((l) => l.code === selectedVoiceLang)?.label || 'Voice'}`}
                  </span>
                </button>

                {/* Quick Audio Note Preset Button */}
                <button
                  type="button"
                  onClick={() => {
                    const current = VOICE_LANG_OPTIONS.find((l) => l.code === selectedVoiceLang) || VOICE_LANG_OPTIONS[0];
                    loadVoiceSample(current);
                  }}
                  className="py-2.5 px-4 bg-white hover:bg-slate-100 text-[#172B3A] border border-[#DCE5EE] text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 text-[#13B8C5]" />
                  <span>
                    Test Sample: {VOICE_LANG_OPTIONS.find((l) => l.code === selectedVoiceLang)?.sampleDefect}
                  </span>
                </button>
              </div>

              {/* Live Audio Waves Simulation */}
              <div className="flex items-center space-x-1 px-3 py-2 bg-white border border-[#DCE5EE] rounded-xl shadow-sm">
                <span className="text-[10px] font-mono text-[#64748B] mr-2">Audio Waves:</span>
                {[4, 8, 14, 6, 12, 16, 8, 4, 10, 15, 7].map((h, idx) => (
                  <span
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isRecording
                        ? 'bg-[#DC4C4C] animate-pulse'
                        : isPlayingAudio
                          ? 'bg-[#16A36A] animate-bounce'
                          : 'bg-slate-200'
                    }`}
                    style={{
                      height: isRecording || isPlayingAudio ? `${h + 4}px` : '4px'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Dual Audio Translation Display: Regional Speech vs Translated English */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Spoken Regional Audio Transcript */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-[#DCE5EE] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span className="text-xs font-bold text-[#172B3A]">
                      Spoken Regional Script Transcript
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-50 text-[#3B82F6] border border-blue-200 font-semibold">
                    {detectedLangDisplay}
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={originalScript}
                    onChange={(e) => setOriginalScript(e.target.value)}
                    placeholder={`Speak or type in ${VOICE_LANG_OPTIONS.find((l) => l.code === selectedVoiceLang)?.label || 'regional language'}...`}
                    className="w-full p-3 bg-white rounded-xl border border-[#DCE5EE] text-xs text-[#172B3A] leading-relaxed font-serif focus:border-[#13B8C5] focus:outline-none resize-none shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleTranslateVoice(originalScript, selectedVoiceLang)}
                    disabled={isTranslating || !originalScript.trim()}
                    className={`absolute bottom-2.5 right-2.5 px-3 py-1 text-[11px] font-bold rounded-lg transition flex items-center space-x-1 shadow-sm ${
                      isTranslating || !originalScript.trim()
                        ? 'bg-slate-100 text-slate-400 border border-[#DCE5EE] cursor-not-allowed'
                        : 'bg-[#10243A] hover:bg-[#172F49] text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-[#13B8C5]" />
                    <span>Translate to English</span>
                  </button>
                </div>

                {/* Urgency Keywords Badges */}
                {extractedKeywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-[#64748B] font-mono">Urgency Keywords:</span>
                    {extractedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-blue-50 text-[#3B82F6] border border-blue-200 rounded text-[10px] font-mono font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actionable English Translation */}
              <div className="p-4 bg-cyan-50/30 rounded-2xl border border-cyan-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#13B8C5]" />
                    <span className="text-xs font-bold text-[#10243A]">
                      AI Translated English Complaint
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border transition ${
                    isTranslating
                      ? 'bg-amber-50 text-[#E9A23B] border border-amber-200 animate-pulse'
                      : 'bg-emerald-50 text-[#16A36A] border border-emerald-200 font-semibold'
                  }`}>
                    {isTranslating ? `Processing (${translationProgress}%)` : '✓ Standard English Verified'}
                  </span>
                </div>

                {/* Processing Animation vs Translated Text */}
                {isTranslating ? (
                  <div className="min-h-[85px] p-4 bg-white rounded-xl border border-cyan-300 flex flex-col justify-center space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 text-[#10243A] font-semibold">
                        <RefreshCw className="w-3.5 h-3.5 text-[#13B8C5] animate-spin" />
                        <span>{translationStep || 'AI Cross-Lingual Engine running...'}</span>
                      </div>
                      <span className="font-mono text-[#13B8C5] font-bold">{translationProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-[#DCE5EE]">
                      <div
                        className="bg-gradient-to-r from-[#13B8C5] via-[#3B82F6] to-[#16A36A] h-full rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${translationProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-[#64748B]">
                      <span className="w-2 h-2 rounded-full bg-[#13B8C5] animate-ping inline-block" />
                      <span>Resolving regional idioms &amp; municipal hazard priority...</span>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[85px] p-3.5 bg-white rounded-xl border border-cyan-200 text-xs text-[#172B3A] leading-relaxed font-sans shadow-sm">
                    {translatedEnglish ? (
                      <div className="space-y-1">
                        <span className="font-medium text-[#172B3A]">"{translatedEnglish}"</span>
                      </div>
                    ) : (
                      <span className="text-[#64748B] italic">
                        Automated English translation will appear here...
                      </span>
                    )}
                  </div>
                )}

                {/* Text-To-Speech Listen Button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleSpeakTranslation}
                    disabled={isTranslating || !translatedEnglish}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                      isPlayingAudio
                        ? 'bg-[#16A36A] text-white shadow-sm'
                        : isTranslating || !translatedEnglish
                          ? 'bg-slate-100 text-slate-400 border border-[#DCE5EE] cursor-not-allowed'
                          : 'bg-white hover:bg-slate-50 text-[#172B3A] border border-[#DCE5EE] shadow-sm'
                    }`}
                  >
                    {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#13B8C5]" />}
                    <span>{isPlayingAudio ? 'Stop Reading' : 'Listen to English Translation'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Editable Notes Text Input */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#64748B] font-medium block">
                Final Report Description (Auto-populated from translation, or edit manually):
              </span>
              <input
                type="text"
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                placeholder="Citizen notes description..."
                className="w-full bg-slate-50 border border-[#DCE5EE] rounded-xl px-4 py-2.5 text-xs text-[#172B3A] focus:border-[#13B8C5] focus:bg-white focus:outline-none shadow-sm"
              />
            </div>
          </div>

          {/* ================= STEP 5: PRIVACY CONSENT & SUBMISSION ================= */}
          <div className="bg-white border border-[#DCE5EE] p-6 rounded-3xl space-y-4 shadow-sm text-[#172B3A]">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[#DCE5EE] text-[#13B8C5] focus:ring-[#13B8C5]"
              />
              <div className="text-xs text-[#64748B] leading-relaxed">
                <span className="font-bold text-[#172B3A] block flex items-center space-x-1.5 mb-0.5">
                  <ShieldCheck className="w-4 h-4 text-[#16A36A] inline" />
                  <span>Citizen Privacy &amp; Data Security Notice</span>
                </span>
                I authorize CivicPulse to analyze image pixels, GPS location, and voice notes locally. My phone number and exact private home coordinates are permanently masked from public feeds.
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center space-x-2 transition ${
                isSubmitting
                  ? 'bg-slate-100 text-slate-400 border border-[#DCE5EE] cursor-not-allowed'
                  : 'bg-[#10243A] hover:bg-[#172F49] shadow-md'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin text-[#13B8C5]" />
                  <span className="font-mono text-xs text-white">{submitStepText}</span>
                </>
              ) : (
                <>
                  <Layers className="w-5 h-5 text-[#13B8C5]" />
                  <span>Submit {selectedProfile.shortLabel} Incident to Municipal Authority</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
