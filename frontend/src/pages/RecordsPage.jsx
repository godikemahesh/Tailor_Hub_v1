import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Mic, 
  MicOff, 
  Plus, 
  Trash2, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Save, 
  Search, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  User, 
  Phone, 
  Tag, 
  FileText, 
  ShoppingBag, 
  Layers, 
  AlertCircle,
  Clock,
  Eye,
  X
} from 'lucide-react';
import { recordsAPI } from '../services/api';
import { store } from '../services/store';
import { useAuth } from '../context/AuthContext';
import './RecordsPage.css';

export default function RecordsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active intake mode: 'voice' | 'manual' | 'ocr'
  const [activeMode, setActiveMode] = useState('voice');

  // ── Database Records List State ──
  const [records, setRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [selectedRecordModal, setSelectedRecordModal] = useState(null);

  // ── Customer Details Form State ──
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCode, setCustomerCode] = useState(() => `REC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [garmentType, setGarmentType] = useState('Blouse');
  const [advancePaid, setAdvancePaid] = useState('');
  const [tailorNotes, setTailorNotes] = useState('');

  // ── Measurements Rows State (Initial state: exactly 1 row for manual mode) ──
  const [measurements, setMeasurements] = useState([
    { id: 1, key: 'Chest', value: '', unit: 'inches' }
  ]);

  // ── Voice AI State Management ──
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [activeVoiceKey, setActiveVoiceKey] = useState(null); // Context-aware state tracking
  const [lastAudioCue, setLastAudioCue] = useState(null);
  const [speechMuted, setSpeechMuted] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [manualVoiceInput, setManualVoiceInput] = useState('');
  const recognitionRef = useRef(null);

  // ── Camera OCR State ──
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load records from Supabase on mount
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const response = await recordsAPI.list();
      if (response && response.data && response.data.length > 0) {
        setRecords(response.data);
      } else {
        // Fallback to store
        setRecords(store.getRecords());
      }
    } catch (err) {
      console.warn('[Records] Falling back to local storage cache:', err.message);
      setRecords(store.getRecords());
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Keep latest state in refs to avoid tearing down SpeechRecognition on every state update
  const measurementsRef = useRef(measurements);
  measurementsRef.current = measurements;
  const activeVoiceKeyRef = useRef(activeVoiceKey);
  activeVoiceKeyRef.current = activeVoiceKey;
  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;
  const isSpeakingRef = useRef(false);
  const speakingCooldownRef = useRef(null);
  const restartTimerRef = useRef(null);
  const activeUtteranceRef = useRef(null);
  const lastProcessedPhraseRef = useRef('');
  const lastProcessedTimeRef = useRef(0);

  // ── Audio Confirmation Helper ──
  const speakFeedback = (phrase) => {
    if (speechMuted || !phrase) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Cancel any lingering audio
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.rate = 1.25;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Retain utterance in ref so Chrome V8 never garbage-collects it prematurely
        activeUtteranceRef.current = utterance;
        isSpeakingRef.current = true;

        // Temporarily pause microphone while speaker is producing audio so it never hears itself!
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch {}
        }

        utterance.onend = () => {
          setTimeout(() => {
            isSpeakingRef.current = false;
            // Re-open microphone after computer speech and room reverberation have cleared
            if (isListeningRef.current && recognitionRef.current) {
              try { recognitionRef.current.start(); } catch {}
            }
          }, 350);
        };

        utterance.onerror = () => {
          isSpeakingRef.current = false;
          if (isListeningRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch {}
          }
        };

        // Safety timeout in case onend never fires
        clearTimeout(speakingCooldownRef.current);
        speakingCooldownRef.current = setTimeout(() => {
          isSpeakingRef.current = false;
          if (isListeningRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch {}
          }
        }, 1200);

        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      isSpeakingRef.current = false;
    }
  };

  // ── Persistent Voice Speech Recognition Setup ──
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognizer = new SpeechRecognition();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = 'en-US';

    recognizer.onresult = async (event) => {
      // If computer is currently producing audio, ignore audio buffer completely
      if (isSpeakingRef.current) return;

      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const heardRaw = (finalTranscript || interim).trim();
      if (!heardRaw) return;

      // Clean punctuation for robust matching
      const cleanNorm = heardRaw.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').trim().toLowerCase();
      const IGNORE_WORDS = ['ok', 'okay', 'done', 'next', 'got it', 'listening', 'mic paused', 'mic is paused', 'stop', 'pause', 'cancel', 'clear', 'yes', 'no', 'hello', 'hi'];

      // Always show what was heard in the UI badge
      setSpeechTranscript(heardRaw);

      // If all words are ignore/echo words (e.g. "done ok", "next done ok", "ok next"), ignore completely!
      const words = cleanNorm.split(/\s+/).filter(Boolean);
      if (words.length > 0 && words.every(w => IGNORE_WORDS.includes(w))) {
        return;
      }

      // If user said a real measurement, process it immediately!
      const textToProcess = (finalTranscript.trim() || interim.trim());
      const now = Date.now();
      
      // Debounce identical duplicate triggers within 800ms
      if (textToProcess && (textToProcess !== lastProcessedPhraseRef.current || now - lastProcessedTimeRef.current > 800)) {
        lastProcessedPhraseRef.current = textToProcess;
        lastProcessedTimeRef.current = now;
        processVoiceSpeech(textToProcess);
      }
    };

    recognizer.onerror = (event) => {
      console.warn('[SpeechRecognition] notice:', event.error);
      // Only terminal permission errors disable listening
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        isListeningRef.current = false;
      }
      // 'no-speech', 'network', 'aborted' are normal pauses in Chrome; onend will automatically keep it alive!
    };

    recognizer.onend = () => {
      // Chrome naturally stops continuous speech every 15-30 seconds or on pause.
      // Automatically keep listening alive seamlessly without user needing to toggle mic!
      if (isListeningRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              // If browser is still releasing audio stream, retry once in 400ms
              setTimeout(() => {
                if (isListeningRef.current && recognitionRef.current) {
                  try { recognitionRef.current.start(); } catch {}
                }
              }, 400);
            }
          }
        }, 150);
      }
    };

    recognitionRef.current = recognizer;

    return () => {
      clearTimeout(restartTimerRef.current);
      clearTimeout(speakingCooldownRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []); // Initialize once! Lifecycle is managed continuously via refs!

  // Keep mic state synced with ref
  useEffect(() => {
    isListeningRef.current = isListening;
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    } else {
      clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    }
  }, [isListening]);

  const toggleMic = () => {
    if (isListening) {
      clearTimeout(restartTimerRef.current);
      setIsListening(false);
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      speakFeedback('Mic paused');
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          isListeningRef.current = true;
          speakFeedback('Listening');
        } catch (e) {
          console.warn('[Mic] start error:', e);
          setIsListening(true);
          isListeningRef.current = true;
        }
      } else {
        alert('Voice speech recognition is supported in modern browsers (Chrome, Edge). You can also type measurements manually or use the quick test buttons.');
      }
    }
  };

  // Process voice input: Instant local filling + Background AI enhancement
  const processVoiceSpeech = async (phrase) => {
    if (!phrase || !phrase.trim()) return;
    const cleanPhrase = phrase.trim();
    setSpeechTranscript(cleanPhrase);

    // 1. Instantly parse locally so the fields fill in 0ms!
    const localResult = executeLocalMeasurementParse(cleanPhrase);
    if (localResult && localResult.handled) {
      // Handled locally!
      return;
    }

    // 2. Fallback to API if complex/conversational
    setVoiceProcessing(true);
    try {
      const response = await recordsAPI.parseVoice({
        transcript: cleanPhrase,
        current_measurements: measurementsRef.current,
        active_key: activeVoiceKeyRef.current
      });

      if (response && response.data) {
        const { recognized_measurements, active_key, audio_cue } = response.data;
        
        if (recognized_measurements && recognized_measurements.length > 0) {
          setMeasurements(recognized_measurements.map((m, idx) => ({
            id: idx + 1,
            key: m.key || 'Measurement',
            value: m.value !== undefined && m.value !== null ? String(m.value) : '',
            unit: m.unit || 'inches'
          })));
        }

        const INVALID_KEYS = ['ok', 'okay', 'done', 'next', 'got it', 'listening', 'cancel', 'clear'];
        if (active_key && INVALID_KEYS.includes(active_key.toLowerCase())) {
          setActiveVoiceKey(null);
        } else {
          setActiveVoiceKey(active_key);
        }

        if (audio_cue) {
          setLastAudioCue(audio_cue);
          speakFeedback(audio_cue);
        }
      }
    } catch (err) {
      console.warn('[Voice API] Using local parser:', err);
    } finally {
      setVoiceProcessing(false);
    }
  };

  // Instant local parser for rapid tailor intake (0ms latency)
  const executeLocalMeasurementParse = (phrase) => {
    const rawClean = phrase.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ').trim();
    const lower = rawClean.toLowerCase().trim();
    const IGNORE = ['ok', 'okay', 'done', 'next', 'got it', 'listening', 'mic paused', 'stop', 'pause', 'clear', 'cancel', 'yes', 'no'];
    
    // If entire phrase or all words are echo feedback words (e.g. "done ok", "next done"), ignore without speaking
    const words = lower.split(/\s+/).filter(Boolean);
    if (IGNORE.includes(lower) || (words.length > 0 && words.every(w => IGNORE.includes(w)))) {
      return { handled: true };
    }

    const KEY_TERMS = {
      'chest': 'Chest',
      'bust': 'Bust',
      'chhati': 'Chest',
      'waist': 'Waist',
      'kamar': 'Waist',
      'hip': 'Hips',
      'hips': 'Hips',
      'shoulder': 'Shoulder',
      'shoulders': 'Shoulder',
      'teera': 'Shoulder',
      'sleeve': 'Sleeve Length',
      'sleeves': 'Sleeve Length',
      'sleeve length': 'Sleeve Length',
      'aasteen': 'Sleeve Length',
      'armhole': 'Armhole',
      'mudda': 'Armhole',
      'bicep': 'Bicep',
      'wrist': 'Wrist',
      'mohri': 'Wrist',
      'length': 'Garment Length',
      'garment length': 'Garment Length',
      'lambaai': 'Garment Length',
      'neck': 'Neck Depth',
      'front neck': 'Front Neck',
      'back neck': 'Back Neck',
      'gala': 'Neck Depth',
      'collar': 'Collar',
      'inseam': 'Inseam',
      'outseam': 'Outseam',
      'thigh': 'Thigh',
      'bottom': 'Bottom Opening',
      'ghera': 'Bottom Opening',
      'slit': 'Side Slit',
      'cross back': 'Cross Back',
      'point': 'Bust Point',
      'dot': 'Bust Point'
    };

    const numMatch = lower.match(/\b(\d+(?:\.\d+)?|\d+\s*1\/2|\d+\s*3\/4|\d+\s*1\/4)\b/);
    const extractedNum = numMatch ? numMatch[1].replace('1/2', '.5').replace('1/4', '.25').replace('3/4', '.75').trim() : null;
    const unit = lower.includes('cm') || lower.includes('centimeter') ? 'cm' : 'inches';

    // Find if a known tailor key was spoken
    let matchedKey = null;
    for (const [k, formatted] of Object.entries(KEY_TERMS)) {
      const regex = new RegExp(`\\b${k}\\b`, 'i');
      if (regex.test(lower)) {
        matchedKey = formatted;
        break;
      }
    }

    const currentMeas = [...measurementsRef.current];
    const currentActiveKey = activeVoiceKeyRef.current;

    // Scenario 1: Context was locked on a key, and tailor now spoke a number (e.g. "38")
    if (currentActiveKey && extractedNum) {
      const targetKey = KEY_TERMS[currentActiveKey.toLowerCase()] || currentActiveKey;
      const existingIdx = currentMeas.findIndex(m => m.key && m.key.toLowerCase() === targetKey.toLowerCase());
      if (existingIdx >= 0) {
        currentMeas[existingIdx] = { ...currentMeas[existingIdx], value: extractedNum, unit };
      } else {
        // Replace empty first row if blank
        if (currentMeas.length === 1 && !currentMeas[0].key && !currentMeas[0].value) {
          currentMeas[0] = { id: 1, key: targetKey, value: extractedNum, unit };
        } else {
          currentMeas.push({ id: Date.now(), key: targetKey, value: extractedNum, unit });
        }
      }
      setMeasurements(currentMeas);
      setActiveVoiceKey(null);
      setLastAudioCue('Done');
      speakFeedback('Done');
      return { handled: true };
    }

    // Scenario 2: Tailor spoke both key and number (e.g. "Chest 38" or "Waist 32 inches")
    if (matchedKey && extractedNum) {
      const existingIdx = currentMeas.findIndex(m => m.key && m.key.toLowerCase() === matchedKey.toLowerCase());
      if (existingIdx >= 0) {
        currentMeas[existingIdx] = { ...currentMeas[existingIdx], value: extractedNum, unit };
      } else {
        if (currentMeas.length === 1 && !currentMeas[0].key && !currentMeas[0].value) {
          currentMeas[0] = { id: 1, key: matchedKey, value: extractedNum, unit };
        } else {
          currentMeas.push({ id: Date.now(), key: matchedKey, value: extractedNum, unit });
        }
      }
      setMeasurements(currentMeas);
      setActiveVoiceKey(null);
      setLastAudioCue('Next');
      speakFeedback('Next');
      return { handled: true };
    }

    // Scenario 3: Tailor spoke only parameter name (e.g. "Chest") -> Lock context & say OK
    if (matchedKey && !extractedNum) {
      setActiveVoiceKey(matchedKey);
      setLastAudioCue('OK');
      speakFeedback('OK');
      return { handled: true };
    }

    // Scenario 4: Tailor spoke a number without key, but no active key
    if (extractedNum && !matchedKey && !currentActiveKey) {
      const genericKey = `Measure ${currentMeas.filter(m => m.value).length + 1}`;
      currentMeas.push({ id: Date.now(), key: genericKey, value: extractedNum, unit });
      setMeasurements(currentMeas);
      setLastAudioCue('Done');
      speakFeedback('Done');
      return { handled: true };
    }

    return { handled: false };
  };

  // ── Dynamic Manual Row Management ──
  const handleAddMeasurementRow = () => {
    setMeasurements(prev => [
      ...prev,
      { id: Date.now(), key: '', value: '', unit: 'inches' }
    ]);
  };

  const handleUpdateMeasurementRow = (id, field, val) => {
    setMeasurements(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));
  };

  const handleRemoveMeasurementRow = (id) => {
    if (measurements.length === 1) {
      // Keep at least 1 row clear
      setMeasurements([{ id: 1, key: '', value: '', unit: 'inches' }]);
      return;
    }
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  // ── Camera OCR Controls ──
  const startCamera = async () => {
    setCameraActive(true);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('[Camera Access] Not available or permission denied:', err);
      setCameraActive(false);
      alert('Camera access denied or unavailable. You can upload a ledger photo directly using the Upload button.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const snapPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();

    // Trigger Groq Vision OCR processing immediately
    runGroqVisionOCR(dataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setCapturedImage(dataUrl);
      runGroqVisionOCR(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const runGroqVisionOCR = async (base64Image) => {
    setIsOCRProcessing(true);
    try {
      const response = await recordsAPI.scanOCR({
        image_base64: base64Image,
        garment_hint: garmentType
      });

      if (response && response.data) {
        const data = response.data;
        if (data.customer_name) setCustomerName(data.customer_name);
        if (data.customer_phone) setCustomerPhone(data.customer_phone);
        if (data.customer_code) setCustomerCode(data.customer_code);
        if (data.garment_type) setGarmentType(data.garment_type);
        if (data.advance_paid) setAdvancePaid(data.advance_paid);
        if (data.notes) setTailorNotes(data.notes);
        if (data.confidence) setOcrConfidence(Math.round(data.confidence * 100));

        if (data.measurements && data.measurements.length > 0) {
          setMeasurements(data.measurements.map((m, idx) => ({
            id: idx + 1,
            key: m.key || 'Measurement',
            value: m.value || '',
            unit: m.unit || 'inches'
          })));
        }

        speakFeedback('Register scanned. Please verify.');
      }
    } catch (err) {
      console.warn('[OCR Error] exception:', err);
      alert('Could not auto-parse register image. Please verify fields manually.');
    } finally {
      setIsOCRProcessing(false);
    }
  };

  // ── Save Record to Cloud & Store ──
  const handleSaveRecord = async () => {
    if (!customerName.trim()) {
      alert('Please provide the Customer Name.');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Please enter the Customer Mobile Number to ensure distinct customer records.');
      return;
    }

    const validMeasurements = measurements
      .filter(m => m.key.trim() && m.value.toString().trim())
      .map(m => ({ key: m.key.trim(), value: m.value.toString().trim(), unit: m.unit || 'inches' }));

    if (validMeasurements.length === 0) {
      alert('Please add at least one measurement parameter (e.g. Chest 38).');
      return;
    }

    const payload = {
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_code: customerCode.trim(),
      garment_type: garmentType.trim(),
      measurements: validMeasurements,
      advance_paid: parseFloat(advancePaid) || 0.0,
      notes: tailorNotes.trim(),
      source: activeMode === 'voice' ? 'voice_ai' : activeMode === 'ocr' ? 'camera_ocr' : 'manual'
    };

    try {
      // 1. Persist via backend API
      const res = await recordsAPI.create(payload);
      const saved = res.data;

      // 2. Also sync to store cache
      store.createRecord(saved);

      // 3. Update local state
      setRecords(prev => [saved, ...prev]);

      setSaveSuccessMsg(`Record for ${customerName} (#${customerCode}) saved successfully!`);
      speakFeedback('Record saved to vault');

      // Reset form
      resetForm();

      setTimeout(() => {
        setSaveSuccessMsg('');
      }, 5000);
    } catch (err) {
      console.warn('[Save Record Error]:', err.message);
      // Fallback local save if offline
      const fallbackSaved = store.createRecord(payload);
      setRecords(prev => [fallbackSaved, ...prev]);
      setSaveSuccessMsg(`Record saved to local cache (#${fallbackSaved.customer_code})!`);
      resetForm();
      setTimeout(() => setSaveSuccessMsg(''), 5000);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerCode(`REC-${Math.floor(1000 + Math.random() * 9000)}`);
    setAdvancePaid('');
    setTailorNotes('');
    setCapturedImage(null);
    setOcrConfidence(null);
    setMeasurements([{ id: 1, key: 'Chest', value: '', unit: 'inches' }]);
    setActiveVoiceKey(null);
    setSpeechTranscript('');
  };

  const handleDeleteRecord = async (recordId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this measurement record permanently?')) return;
    try {
      await recordsAPI.delete(recordId);
    } catch (e) {
      console.warn('API delete error, deleting locally:', e.message);
    }
    store.deleteRecord(recordId);
    setRecords(prev => prev.filter(r => r.id !== recordId));
  };

  // Filter records by name, phone, or garment
  const filteredRecords = records.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      (r.customer_name && r.customer_name.toLowerCase().includes(q)) ||
      (r.customer_phone && r.customer_phone.includes(q)) ||
      (r.customer_code && r.customer_code.toLowerCase().includes(q)) ||
      (r.garment_type && r.garment_type.toLowerCase().includes(q))
    );
  });

  return (
    <div className="records-container">
      {/* ── Top Header ── */}
      <div className="records-header">
        <div>
          <div className="atelier-badge" style={{ marginBottom: '8px' }}>
            <BookOpen size={14} />
            <span>Atelier Measurement Vault • Digital Records</span>
          </div>
          <h1 className="atelier-title" style={{ fontSize: '1.85rem' }}>Tailor Records & Multi-Modal Register</h1>
          <p className="atelier-subtitle">
            Capture client measurements hands-free with Voice AI, dynamically enter measurements, or digitize physical ledger notebooks with smart camera recognition.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mode-selector-bar">
          <button 
            type="button" 
            className={`mode-btn ${activeMode === 'voice' ? 'active' : ''}`}
            onClick={() => { setActiveMode('voice'); if (cameraActive) stopCamera(); }}
          >
            <Mic size={16} />
            <span>Record Measurements (Voice)</span>
          </button>
          <button 
            type="button" 
            className={`mode-btn ${activeMode === 'manual' ? 'active' : ''}`}
            onClick={() => { setActiveMode('manual'); if (cameraActive) stopCamera(); }}
          >
            <Layers size={16} />
            <span>Enter Measurements (Manual)</span>
          </button>
          <button 
            type="button" 
            className={`mode-btn ${activeMode === 'ocr' ? 'active' : ''}`}
            onClick={() => { setActiveMode('ocr'); startCamera(); }}
          >
            <Camera size={16} />
            <span>Scan New Record (Camera Scanner)</span>
          </button>
        </div>
      </div>

      {/* ── Stats Ribbon ── */}
      <div className="records-stats-ribbon">
        <div className="record-stat-box">
          <div className="stat-icon-wrapper terracotta">
            <BookOpen size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-val">{records.length}</div>
            <div className="stat-lbl">Saved Client Records</div>
          </div>
        </div>
        <div className="record-stat-box">
          <div className="stat-icon-wrapper emerald">
            <Mic size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-val">
              {records.filter(r => r.source === 'voice_ai').length}
            </div>
            <div className="stat-lbl">Voice Captured</div>
          </div>
        </div>
        <div className="record-stat-box">
          <div className="stat-icon-wrapper amber">
            <Camera size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-val">
              {records.filter(r => r.source === 'camera_ocr').length}
            </div>
            <div className="stat-lbl">Physical Ledger Digitized</div>
          </div>
        </div>
        <div className="record-stat-box">
          <div className="stat-icon-wrapper indigo">
            <Sparkles size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-val">Smart AI</div>
            <div className="stat-lbl">Intelligent Fit Assistant</div>
          </div>
        </div>
      </div>

      {/* ── Success Toast Banner ── */}
      {saveSuccessMsg && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #6ee7b7',
          color: '#065f46',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
        }}>
          <CheckCircle2 size={20} color="#059669" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ── Main Intake Workspace Card ── */}
      <div className="intake-card">
        <div className="intake-card-header">
          <div className="intake-card-title">
            {activeMode === 'voice' && <Mic size={20} color="#c85a17" />}
            {activeMode === 'manual' && <Layers size={20} color="#c85a17" />}
            {activeMode === 'ocr' && <Camera size={20} color="#c85a17" />}
            <span>
              {activeMode === 'voice' && 'Voice-Powered Measurement Intake'}
              {activeMode === 'manual' && 'Dynamic Key-Value-Unit Measurement Entry'}
              {activeMode === 'ocr' && 'Physical Register Book Scanner & Digitizer'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              type="button" 
              onClick={() => setSpeechMuted(!speechMuted)}
              className="action-pill-btn secondary"
              title={speechMuted ? 'Unmute Verbal Confirmation' : 'Mute Verbal Confirmation'}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
            >
              {speechMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{speechMuted ? 'Voice Muted' : 'Voice Cues Active'}</span>
            </button>
            <button 
              type="button"
              onClick={resetForm}
              className="action-pill-btn secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
            >
              <RefreshCw size={14} />
              <span>Reset Fields</span>
            </button>
          </div>
        </div>

        {/* ── Mode 1: Voice AI Active Hub ── */}
        {activeMode === 'voice' && (
          <div className="voice-ai-hub">
            <div className="mic-button-wrapper">
              {isListening && <div className="pulse-ring"></div>}
              <button 
                type="button"
                className={`mic-action-btn ${isListening ? 'listening' : 'idle'} ${voiceProcessing ? 'thinking' : ''}`}
                onClick={toggleMic}
                title={isListening ? 'Click to pause listening' : 'Click to start voice measurement'}
              >
                {isListening ? <Mic size={36} /> : <MicOff size={36} />}
              </button>
            </div>

            <div className={`voice-status-pill ${isListening ? 'listening' : 'idle'}`}>
              <span className="pulse-dot" style={{ background: isListening ? '#10b981' : '#9ca3af' }}></span>
              <span>{isListening ? '🎤 Listening... Speak measurements (e.g. "Chest 38", "Waist 32")' : 'Mic is Paused — Click Mic to Start Intake'}</span>
            </div>

            {/* Context & State Tracker: Active Key Notice */}
            {activeVoiceKey && (
              <div className="voice-active-key-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} />
                <span>Context Locked: Waiting for <strong>{activeVoiceKey}</strong> numeric measurement...</span>
                <button 
                  type="button" 
                  onClick={() => setActiveVoiceKey(null)}
                  style={{ background: '#fef08a', border: '1px solid #fde047', borderRadius: '4px', cursor: 'pointer', padding: '1px 6px', fontSize: '0.72rem', color: '#854d0e', marginLeft: '6px' }}
                  title="Unlock/clear context"
                >
                  Clear
                </button>
              </div>
            )}

            {lastAudioCue && (
              <div className="voice-cue-chip">
                <span>Tailor Audio Confirmation: "{lastAudioCue}"</span>
              </div>
            )}

            {/* Prominent Live Heard Display */}
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1.6rem',
              borderRadius: '12px',
              background: speechTranscript ? '#f0fdf4' : '#fafaf9',
              border: `1.5px solid ${speechTranscript ? '#86efac' : '#e7e5e4'}`,
              color: speechTranscript ? '#166534' : '#78716c',
              fontWeight: 600,
              fontSize: '0.98rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: speechTranscript ? '0 2px 8px rgba(34, 197, 94, 0.12)' : 'none',
              transition: 'all 0.2s ease'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Mic size={16} color="#16a34a" /> Heard:
              </span>
              <span style={{ color: speechTranscript ? '#15803d' : '#a8a29e', fontStyle: speechTranscript ? 'normal' : 'italic', fontWeight: 700 }}>
                {speechTranscript ? `"${speechTranscript}"` : '(Waiting for speech...)'}
              </span>
            </div>

            {/* Quick Voice Testing Toolbar for Atelier Environments */}
            <div style={{ marginTop: '1.25rem', width: '100%', maxWidth: '580px', background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #ede5da' }}>
              <div style={{ fontSize: '0.78rem', color: '#786c5e', fontWeight: 600, marginBottom: '6px' }}>
                Workshop Voice Simulator (Test Hands-Free Intake with One Click):
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '10px' }}>
                {['Chest 38', 'Waist 30', 'Shoulder 14.5', 'Length 14', 'Wrist 36', 'Chest', '38 inches'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    className="action-pill-btn secondary"
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                    onClick={() => processVoiceSpeech(preset)}
                  >
                    + "{preset}"
                  </button>
                ))}
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualVoiceInput.trim()) {
                    processVoiceSpeech(manualVoiceInput.trim());
                    setManualVoiceInput('');
                  }
                }}
                style={{ display: 'flex', gap: '8px' }}
              >
                <input 
                  type="text" 
                  className="control-input" 
                  placeholder="Or simulate speech e.g. 'Chest 38', 'Waist 32'..." 
                  value={manualVoiceInput}
                  onChange={e => setManualVoiceInput(e.target.value)}
                />
                <button type="submit" className="action-pill-btn primary" style={{ whiteSpace: 'nowrap', padding: '0.5rem 1.2rem' }}>
                  ⚡ Auto-Fill Measurement
                </button>
              </form>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: '#8c7d6e', maxWidth: '580px' }}>
              💡 <strong>Hands-Free Rule:</strong> You can say <em>"Chest"</em>, take 3 seconds to measure the client with your tape, then say <em>"38 inches"</em>. The system retains context across pauses and confirms aloud with <em>"OK"</em> and <em>"Done"</em>.
            </div>
          </div>
        )}

        {/* ── Mode 3: Camera OCR Live Viewfinder ── */}
        {activeMode === 'ocr' && (
          <div style={{ marginBottom: '2rem' }}>
            {cameraActive && (
              <div className="camera-viewfinder-box">
                <video ref={videoRef} className="camera-video-stream" autoPlay playsInline muted />
                <div className="camera-guide-overlay">
                  <span>ALIGN OLD BOOK PAGE / LEDGER WITHIN BORDER</span>
                </div>
              </div>
            )}

            {capturedImage && (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <img 
                  src={capturedImage} 
                  alt="Captured Ledger" 
                  style={{ maxHeight: '280px', borderRadius: '12px', border: '2px solid #c85a17', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                />
                {ocrConfidence && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                    ✨ Recognition Confidence: {ocrConfidence}% Match
                  </div>
                )}
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="camera-shutter-bar">
              {cameraActive ? (
                <>
                  <button type="button" className="camera-shutter-btn" onClick={snapPhoto}>
                    <Camera size={18} />
                    <span>Capture Photo & Digitize Record</span>
                  </button>
                  <button type="button" className="action-pill-btn secondary" onClick={stopCamera}>
                    Cancel Camera
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="action-pill-btn primary" onClick={startCamera}>
                    <Camera size={16} />
                    <span>Open Camera Viewfinder</span>
                  </button>
                  <button 
                    type="button" 
                    className="action-pill-btn secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} />
                    <span>Upload Notebook Photo</span>
                  </button>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleFileUpload}
                  />
                </>
              )}
            </div>

            {isOCRProcessing && (
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
                <div className="pulse-dot" style={{ width: '12px', height: '12px', margin: '0 auto 8px' }}></div>
                <strong style={{ color: '#92400e' }}>Analyzing Ledger Document & Handwriting...</strong>
                <p style={{ fontSize: '0.82rem', color: '#b45309', margin: '4px 0 0' }}>
                  Digitizing cursive ledger entries, customer details, and measurements into verified fields.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Customer Identity Section (Prevents Duplicate Name Confusion) ── */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e1b18', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={16} color="#c85a17" />
          <span>Customer Identification & Garment Details</span>
        </h3>

        <div className="customer-info-grid">
          <div className="control-group">
            <label>Customer Full Name *</label>
            <input 
              type="text" 
              className="control-input" 
              placeholder="e.g. Pooja Sharma"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="control-group">
            <label>Mobile Number * (Unique Client ID)</label>
            <input 
              type="tel" 
              className="control-input" 
              placeholder="e.g. 9811223344"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              required
            />
          </div>

          <div className="control-group">
            <label>Garment Style / Type</label>
            <select 
              className="control-select"
              value={garmentType}
              onChange={e => setGarmentType(e.target.value)}
            >
              <option value="Blouse">Blouse (Bridal / Sweetheart)</option>
              <option value="Kurta">Kurta / Kurti</option>
              <option value="Anarkali">Anarkali Suit</option>
              <option value="Suit">Formal Suit / Bandhgala</option>
              <option value="Shirt">Formal / Casual Shirt</option>
              <option value="Trouser">Trouser / Pants</option>
              <option value="Lehenga">Designer Lehenga</option>
              <option value="Sherwani">Royal Sherwani</option>
              <option value="Dress">Western Gown / Dress</option>
            </select>
          </div>

          <div className="control-group">
            <label>Record Code / Book Page #</label>
            <input 
              type="text" 
              className="control-input" 
              value={customerCode}
              onChange={e => setCustomerCode(e.target.value)}
              title="Unique record reference to prevent name collision"
            />
          </div>
        </div>

        {/* ── Dynamic Key-Value-Unit Measurement Rows ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e1b18', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tag size={16} color="#c85a17" />
            <span>Body Measurements (Key, Value & Unit)</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#7c7267' }}>
            {measurements.length} parameter{measurements.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        <div className="measurement-rows-container">
          {measurements.map((row, idx) => (
            <div key={row.id || idx} className="measurement-row">
              <div>
                <input 
                  type="text" 
                  className="control-input" 
                  placeholder="Parameter (e.g. Chest, Waist, Wrist)"
                  value={row.key}
                  onChange={e => handleUpdateMeasurementRow(row.id, 'key', e.target.value)}
                />
              </div>
              <div>
                <input 
                  type="text" 
                  className="control-input" 
                  placeholder="Measurement (e.g. 38, 14.5)"
                  value={row.value}
                  onChange={e => handleUpdateMeasurementRow(row.id, 'value', e.target.value)}
                />
              </div>
              <div>
                <select 
                  className="control-select"
                  value={row.unit}
                  onChange={e => handleUpdateMeasurementRow(row.id, 'unit', e.target.value)}
                >
                  <option value="inches">inches (″)</option>
                  <option value="cm">centimeters (cm)</option>
                </select>
              </div>
              <div>
                <button 
                  type="button" 
                  className="row-delete-btn"
                  onClick={() => handleRemoveMeasurementRow(row.id)}
                  title="Remove this measurement parameter"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Row Button */}
        <button 
          type="button" 
          className="add-row-btn"
          onClick={handleAddMeasurementRow}
        >
          <Plus size={16} />
          <span>+ Add Measurement Parameter</span>
        </button>

        {/* Tailor Notes & Advance */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="control-group">
            <label>Advance Deposit (₹)</label>
            <input 
              type="number" 
              className="control-input" 
              placeholder="e.g. 500"
              value={advancePaid}
              onChange={e => setAdvancePaid(e.target.value)}
            />
          </div>
          <div className="control-group">
            <label>Notes & Stitching Specifications</label>
            <input 
              type="text" 
              className="control-input" 
              placeholder="e.g. Deep neck with dori latkans, 2.5-inch inner safety margin"
              value={tailorNotes}
              onChange={e => setTailorNotes(e.target.value)}
            />
          </div>
        </div>

        {/* ── Save Action Button ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f0eae1', paddingTop: '1.25rem' }}>
          <button 
            type="button" 
            className="action-pill-btn secondary"
            onClick={resetForm}
          >
            Clear
          </button>
          <button 
            type="button" 
            className="action-pill-btn primary"
            onClick={handleSaveRecord}
            style={{ padding: '0.85rem 2.2rem', fontSize: '0.95rem' }}
          >
            <Save size={18} />
            <span>Save Measurement Record</span>
          </button>
        </div>
      </div>

      {/* ── Saved Records Registry (All Saved Tailor Records) ── */}
      <div className="saved-records-section">
        <div className="saved-records-toolbar">
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1e1b18', margin: 0 }}>
              Tailor Measurement Records Directory
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#786c5e', margin: '4px 0 0' }}>
              All saved client fit profiles stored in your digital ledger. Search by name or phone to resolve clients with identical names.
            </p>
          </div>

          <div className="search-input-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by customer name, phone, or code..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Records Grid */}
        {isLoadingRecords ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 10px' }}></div>
            <p style={{ color: '#7c7267' }}>Loading saved records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px dashed #dcd3c8' }}>
            <BookOpen size={40} color="#b4a797" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#1e1b18', marginBottom: '0.5rem' }}>No measurement records found</h3>
            <p style={{ color: '#786c5e', fontSize: '0.875rem' }}>
              Record measurements hands-free using the Voice mic or enter measurements manually above.
            </p>
          </div>
        ) : (
          <div className="records-grid">
            {filteredRecords.map(record => (
              <div 
                key={record.id} 
                className="record-card"
                onClick={() => setSelectedRecordModal(record)}
                style={{ cursor: 'pointer' }}
              >
                <div className="record-card-header">
                  <div>
                    <div className="customer-name-heading">
                      <span>{record.customer_name}</span>
                    </div>
                    <div className="customer-phone-line">
                      <Phone size={13} />
                      <span>{record.customer_phone || 'No phone'}</span>
                    </div>
                  </div>
                  <span className="customer-code-badge">{record.customer_code}</span>
                </div>

                <div className="record-meta-chips">
                  <span className="garment-tag-chip">{record.garment_type}</span>
                  <span className={`source-badge ${record.source || 'manual'}`}>
                    {record.source === 'voice_ai' && '🎙️ Voice AI'}
                    {record.source === 'camera_ocr' && '📸 Camera Scan'}
                    {(!record.source || record.source === 'manual') && '✍️ Manual'}
                  </span>
                  {record.advance_paid > 0 && (
                    <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      Adv. ₹{record.advance_paid}
                    </span>
                  )}
                </div>

                {/* Measurements badges */}
                <div className="measurements-pills-wrap">
                  {(record.measurements || []).slice(0, 6).map((m, idx) => (
                    <div key={idx} className="meas-pill">
                      <span>{m.key}: </span>
                      <strong>{m.value} {m.unit === 'cm' ? 'cm' : '″'}</strong>
                    </div>
                  ))}
                  {(record.measurements || []).length > 6 && (
                    <div className="meas-pill" style={{ background: '#f3ece3', color: '#685949' }}>
                      +{(record.measurements || []).length - 6} more
                    </div>
                  )}
                </div>

                {record.notes && (
                  <p style={{ fontSize: '0.78rem', color: '#716355', margin: '0 0 1rem', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{record.notes}"
                  </p>
                )}

                <div className="record-card-footer">
                  <span style={{ fontSize: '0.72rem', color: '#9e9081' }}>
                    {record.created_at ? new Date(record.created_at).toLocaleDateString() : 'Recent'}
                  </span>

                  <div className="record-action-links" onClick={e => e.stopPropagation()}>
                    <Link 
                      to="/design-order"
                      state={{ clientRecord: record }}
                      className="action-pill-btn secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: '#fefce8', color: '#854d0e', borderColor: '#fef08a' }}
                      title="Create order using these measurements"
                    >
                      <ShoppingBag size={13} />
                      <span>Book Order</span>
                    </Link>

                    <button 
                      type="button" 
                      onClick={(e) => handleDeleteRecord(record.id, e)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Delete Record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Record Detail Modal ── */}
      {selectedRecordModal && (
        <div className="modal-overlay" onClick={() => setSelectedRecordModal(null)}>
          <div className="modal-content-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f0eae1', paddingBottom: '0.75rem' }}>
              <div>
                <span className="customer-code-badge">{selectedRecordModal.customer_code}</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e1b18', margin: '4px 0 0' }}>
                  {selectedRecordModal.customer_name}
                </h2>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedRecordModal(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#7c7267' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#807264' }}>Phone Number:</span>
                <div style={{ fontWeight: 600, color: '#1e1b18' }}>{selectedRecordModal.customer_phone || 'Not provided'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#807264' }}>Garment Style:</span>
                <div style={{ fontWeight: 600, color: '#1e1b18' }}>{selectedRecordModal.garment_type}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#807264' }}>Intake Source:</span>
                <div style={{ fontWeight: 600, color: '#1e1b18' }}>{selectedRecordModal.source}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#807264' }}>Advance Paid:</span>
                <div style={{ fontWeight: 600, color: '#16a34a' }}>₹{selectedRecordModal.advance_paid || 0}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e1b18', marginBottom: '0.75rem' }}>
              Full Body Measurements:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '1.5rem' }}>
              {(selectedRecordModal.measurements || []).map((m, idx) => (
                <div key={idx} style={{ background: '#fbf9f6', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ede5da', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#66594b' }}>{m.key}</span>
                  <strong style={{ color: '#1e1b18' }}>{m.value} {m.unit === 'cm' ? 'cm' : 'inches'}</strong>
                </div>
              ))}
            </div>

            {selectedRecordModal.notes && (
              <div style={{ background: '#fefce8', padding: '12px', borderRadius: '8px', border: '1px solid #fef08a', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#854d0e', display: 'block', marginBottom: '2px' }}>
                  Tailor Notes:
                </span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#713f12' }}>
                  {selectedRecordModal.notes}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Link 
                to="/design-order"
                state={{ clientRecord: selectedRecordModal }}
                className="action-pill-btn primary"
                style={{ textDecoration: 'none' }}
              >
                <ShoppingBag size={16} />
                <span>Book Bespoke Order with this Record</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
