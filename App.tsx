import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd-mobile';
import { Coordinates, Landmark, AudioState, SubAttraction, User } from './types';
import { findNearbyLandmarks, generateLandmarkAudio, identifyLandmarkFromMultimodal, fetchSubAttractions, searchLocation, searchLandmarks, loadAMap, getKeys, setGeminiKey } from './services/geminiService';
import { unlockAudioOnUserGesture, ensureAudioUnlockedNow } from './utils/audioUtils';
// Extracted views
import HomeView from './components/HomeView';
import ProfileView from './components/ProfileView';
// Landmark detail view extracted to `components/LandmarkDetailPage.tsx`
import { BackIcon, MapIcon, UserIcon } from './components/icons';
import GlobalAudioPlayer from './components/GlobalAudioPlayer';
import DonationModal from './components/DonationModal';
import LandmarkDetailPage from './components/LandmarkDetailPage';
import SearchResultsPage from './components/SearchResultsPage';
import CategoryListPage from './components/CategoryListPage';
import MainRouter from './components/MainRouter';
import { NavProvider, useNav } from './context/NavContext';
import { AppProvider } from './context/AppContext';


const AppCore: React.FC = () => {
    // Local types (moved here because central `types.ts` doesn't declare them)
    type SubPageLocal = 'landmark_detail' | 'search_results' | 'category_list' | 'login' | 'register' | 'edit_profile' | 'api_key_settings' | 'voice_settings' | 'history' | null;
    interface HistoryItem extends Landmark { timestamp: number; fullText?: string }

    // Navigation context (push/pop handled through NavContext)
    const { navStack, pushView, popView } = useNav();

    // UI/navigation state that was moved out during refactor
    const [activeTab, setActiveTab] = useState<'home'|'profile'>('home');
    const [subPage, setSubPage] = useState<SubPageLocal>(null);
    const [currentLandmark, setCurrentLandmark] = useState<Landmark | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('attractions');

        // Location and scanning state
        const [coords, setCoords] = useState<Coordinates | null>(null);
        const [locationName, setLocationName] = useState<string>('定位当前位置');
        const [scanning, setScanning] = useState(false);

        // Audio and voice state
        const [audioState, setAudioState] = useState<AudioState>({ isPlaying: false, isPaused: false, isLoading: false, currentText: null, playingItemName: null });
        const [selectedVoice, setSelectedVoice] = useState<string>('Fenrir');

        // Theme
        const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

        // App data state
        const [landmarks, setLandmarks] = useState<Landmark[]>([]);
        const [history, setHistory] = useState<any[]>([]);
        const [user, setUser] = useState<User | null>(null);
        const [showDonation, setShowDonation] = useState(false);

    const navigateTo = (targetSubPage: SubPageLocal, opts?: { activeTab?: 'home'|'profile', currentLandmark?: Landmark | null, activeCategory?: string }) => {
        // push current view onto stack then navigate (store a snapshot in NavContext)
        try { pushView({ activeTab, subPage, currentLandmark, activeCategory }); } catch(e) {}
        try {
            if (opts?.activeTab) setActiveTab(opts.activeTab);
            if (typeof opts?.activeCategory !== 'undefined') setActiveCategory(opts.activeCategory || 'attractions');
            if (typeof opts?.currentLandmark !== 'undefined') setCurrentLandmark(opts.currentLandmark || null);
        } catch (e) {}
        setSubPage(targetSubPage);
    };
  const [hasKeys, setHasKeys] = useState(false);
    // Current API indicator for dev diagnostics (AMap, DeepSeek, Gemini, Local)
    const [currentApi, setCurrentApi] = useState<string | null>(null);
    // UI toast for fallback notifications
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    // Gemini leaked-key modal state
    const [geminiLeaked, setGeminiLeaked] = useState(false);
    const [geminiLeakedMsg, setGeminiLeakedMsg] = useState<string | null>(null);
    useEffect(() => {
        if (!toastMessage) return;
        const t = setTimeout(() => setToastMessage(null), 3000);
        return () => clearTimeout(t);
    }, [toastMessage]);

    // Dev AMap Events panel removed. Logs will be written to console only via addAmapLog.
  
  // Search State
  const [searchQueryForPage, setSearchQueryForPage] = useState('');
  const [searchResults, setSearchResults] = useState<Landmark[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // New Inputs for Multimodal
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // New Service Integration: Store audio controls
  const audioControlsRef = useRef<{ stop: () => void; pause: () => void; resume: () => void } | null>(null);

    // Listen for missing service keys / AMap events and show friendly toasts for diagnostics
    const addAmapLog = (label: string, detail?: any) => {
        try {
            const ts = new Date().toLocaleTimeString();
            console.log(ts, label, detail);

            // Labels that should surface a visible toast to the user
            const critical = new Set([
                'amap-load-error',
                'amap-search-failed',
                'amap-geolocate-failed',
                'amap-key-missing',
                'gemini-key-missing',
                'test-amap-failed',
                'test-gemini-failed',
                'convertFrom-ex',
                'geocoder.getAddress-ex',
                'geocoder-after-convert-ex'
            ]);

            if (critical.has(label)) {
                try {
                    let msg = '';
                    if (!detail) msg = label;
                    else if (typeof detail === 'string') msg = detail;
                    else if (detail?.message) msg = detail.message;
                    else msg = JSON.stringify(detail);
                    setToastMessage(`${label}: ${msg}`);
                } catch (e) {
                    console.warn('addAmapLog toast failed', e);
                }
            }
        } catch (e) {}
    };

    // Reverse geocode helper: try convertFrom (GPS->GCJ) when available, then geocoder.getAddress
    // If reverse geocoding fails, return a formatted coordinate string so the UI can display the raw location.
    const reverseGeocodeWithConvert = async (AMap: any, c: { latitude: number; longitude: number }): Promise<string | null> => {
        const formatCoords = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        return new Promise((resolve) => {
            try {
                const geocoder = new AMap.Geocoder();

                const tryDirect = () => {
                    try {
                        geocoder.getAddress([c.longitude, c.latitude], (gStatus: string, gRes: any) => {
                            addAmapLog('geocoder.getAddress', { gStatus, gRes });
                            if (gStatus === 'complete' && gRes && gRes.regeocode) {
                                resolve(gRes.regeocode.formattedAddress || formatCoords(c.latitude, c.longitude));
                            } else {
                                // If no address found, return coordinates
                                resolve(formatCoords(c.latitude, c.longitude));
                            }
                        });
                    } catch (e) {
                        addAmapLog('geocoder.getAddress-ex', String(e));
                        resolve(formatCoords(c.latitude, c.longitude));
                    }
                };

                if (typeof AMap.convertFrom === 'function') {
                    try {
                        (AMap as any).convertFrom([c.longitude, c.latitude], 'gps', (status: string, res: any) => {
                            addAmapLog('AMap.convertFrom', { status, res });
                            if (status === 'complete' && res && res.info === 'ok' && Array.isArray(res.locations) && res.locations.length) {
                                const raw = res.locations[0];
                                let convLng: number | null = null;
                                let convLat: number | null = null;
                                if (Array.isArray(raw) && raw.length >= 2) {
                                    convLng = Number(raw[0]);
                                    convLat = Number(raw[1]);
                                } else if (raw && typeof raw === 'object' && ('lng' in raw || 'lon' in raw || 'lat' in raw)) {
                                    convLng = Number((raw as any).lng ?? (raw as any).lon);
                                    convLat = Number((raw as any).lat ?? (raw as any).lat);
                                }

                                if (convLng != null && convLat != null) {
                                    try {
                                        geocoder.getAddress([convLng, convLat], (gStatus: string, gRes: any) => {
                                            addAmapLog('geocoder.getAddress-after-convert', { gStatus, gRes });
                                            if (gStatus === 'complete' && gRes && gRes.regeocode) {
                                                resolve(gRes.regeocode.formattedAddress || formatCoords(convLat, convLng));
                                            } else {
                                                // fallback to original coords
                                                resolve(formatCoords(c.latitude, c.longitude));
                                            }
                                        });
                                    } catch (e) {
                                        addAmapLog('geocoder-after-convert-ex', String(e));
                                        resolve(formatCoords(c.latitude, c.longitude));
                                    }
                                } else {
                                    // Could not parse converted value
                                    resolve(formatCoords(c.latitude, c.longitude));
                                }
                            } else {
                                // convertFrom didn't yield, try direct
                                tryDirect();
                            }
                        });
                    } catch (e) {
                        addAmapLog('convertFrom-ex', String(e));
                        tryDirect();
                    }
                } else {
                    tryDirect();
                }
            } catch (err) {
                addAmapLog('reverseGeocode-ex', String(err));
                resolve(formatCoords(c.latitude, c.longitude));
            }
        });
    };

    // Dev helpers: test AMap script load and Gemini module import from the running app
    const testAmapKey = async () => {
        try {
            setToastMessage('Testing AMap script...');
            setCurrentApi('AMap (test)');
            addAmapLog('test-amap', 'starting');
            await loadAMap();
            addAmapLog('test-amap', 'AMap loaded OK');
            setToastMessage('AMap script loaded OK');
        } catch (e: any) {
            addAmapLog('test-amap-failed', String(e));
            setToastMessage('AMap test failed: ' + (e?.message || String(e)));
        } finally {
            setCurrentApi(null);
        }
    };

    const testGeminiImport = async () => {
        try {
            setToastMessage('Testing Gemini import...');
            addAmapLog('test-gemini', 'importing');
            const gemKey = getKeys().geminiKey;
            const cdnUrl = 'https://esm.sh/@google/genai';
            const mod = await import(/* @vite-ignore */ cdnUrl);
            addAmapLog('test-gemini', 'imported');
            const GoogleGenAI = (mod as any).GoogleGenAI || (mod as any).default || mod;
            try {
                // Constructing may or may not perform network operations depending on library
                // We attempt construction to detect immediate failures.
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const inst = new GoogleGenAI({ apiKey: gemKey || '' });
                addAmapLog('test-gemini', 'constructed');
                setToastMessage('Gemini module import OK (construction attempted)');
            } catch (ctorErr: any) {
                addAmapLog('test-gemini', 'construct-failed: ' + String(ctorErr));
                setToastMessage('Gemini construct failed: ' + (ctorErr?.message || String(ctorErr)));
            }
        } catch (impErr: any) {
            addAmapLog('test-gemini-failed', String(impErr));
            setToastMessage('Gemini import failed: ' + (impErr?.message || String(impErr)));
        }
    };

    useEffect(() => {
        const onGeminiMissing = (ev: any) => {
            try {
                console.warn('Gemini key missing event received', ev?.detail);
                // If the event indicates a leaked/revoked key, surface a stronger modal to prompt rotation.
                const ignored = sessionStorage.getItem('GEMINI_LEAK_IGNORED');
                const reason = ev?.detail?.reason || null;
                const message = ev?.detail?.message || ev?.detail || '';
                addAmapLog('gemini-key-missing', ev?.detail);
                if (reason === 'GEMINI_KEY_LEAKED' && !ignored) {
                    try { setGeminiKey(''); } catch (e) {}
                    setGeminiLeakedMsg(typeof message === 'string' ? message : JSON.stringify(message));
                    setGeminiLeaked(true);
                    setToastMessage('检测到 Gemini Key 被撤销，请前往「服务配置」更新');
                } else {
                    setToastMessage('未配置 Gemini API Key，打开「服务配置」设置以继续');
                }
            } catch (e) {}
        };

        const onAmapKeyMissing = (ev: any) => {
            try {
                console.warn('AMap keys missing', ev?.detail);
                setToastMessage('未配置 AMap Key/Secret，地图定位不可用');
                addAmapLog('amap-key-missing', ev?.detail);
            } catch (e) {}
        };

        const onAmapLoadError = (ev: any) => {
            try {
                console.error('AMap script load failed', ev?.detail);
                setToastMessage(`AMap 加载失败: ${ev?.detail?.error || 'unknown'}`);
                addAmapLog('amap-load-error', ev?.detail);
            } catch (e) {}
        };

        const onAmapSearchFailed = (ev: any) => {
            try {
                console.warn('AMap search failed', ev?.detail);
                const info = ev?.detail?.info || ev?.detail?.status || '未知';
                setToastMessage(`AMap 查询失败: ${info}`);
                addAmapLog('amap-search-failed', ev?.detail);
            } catch (e) {}
        };

        const onAmapGeolocateFailed = (ev: any) => {
            try {
                console.warn('AMap geolocation failed', ev?.detail);
                setToastMessage('AMap 定位失败，已回退到浏览器定位');
                addAmapLog('amap-geolocate-failed', ev?.detail);
            } catch (e) {}
        };

        window.addEventListener('gemini-key-missing', onGeminiMissing as EventListener);
        window.addEventListener('amap-key-missing', onAmapKeyMissing as EventListener);
        window.addEventListener('amap-load-error', onAmapLoadError as EventListener);
        window.addEventListener('amap-search-failed', onAmapSearchFailed as EventListener);
        window.addEventListener('amap-geolocate-failed', onAmapGeolocateFailed as EventListener);

        return () => {
            window.removeEventListener('gemini-key-missing', onGeminiMissing as EventListener);
            window.removeEventListener('amap-key-missing', onAmapKeyMissing as EventListener);
            window.removeEventListener('amap-load-error', onAmapLoadError as EventListener);
            window.removeEventListener('amap-search-failed', onAmapSearchFailed as EventListener);
            window.removeEventListener('amap-geolocate-failed', onAmapGeolocateFailed as EventListener);
        };
    }, []);
    

  // Check keys on load (keys must be provided manually via UI into the key manager)
  useEffect(() => {
        const ks = getKeys();
        if ((ks.amapKey && ks.amapSecret && ks.llmKey) || ks.geminiKey) {
            setHasKeys(true);
        } else {
            setHasKeys(false);
        }
  }, [subPage]);

  const refreshLocation = async () => {
      setLocationName("定位中...");

      // First try AMap Geolocation (higher reliability in some regions)
      try {
          setCurrentApi('AMap (Geolocation)');
          const AMap = await loadAMap();
          await new Promise<void>((resolve, reject) => {
              try {
                  (AMap as any).plugin('AMap.Geolocation', () => {
                      try {
                          const geo = new (AMap as any).Geolocation({ enableHighAccuracy: true, timeout: 10000 });
                          geo.getCurrentPosition((status: string, result: any) => {
                              if (status === 'complete' && result && result.position) {
                                          const c = { latitude: result.position.lat, longitude: result.position.lng };
                                          setCoords(c);
                                          // Try reverse geocoding to produce a friendly location name
                                          try {
                                              // Use helper that attempts convertFrom when needed
                                              reverseGeocodeWithConvert(AMap, c).then((addr) => {
                                                  if (addr) setLocationName(addr);
                                                  else setLocationName('当前位置');
                                              });
                                          } catch (e) {
                                              setLocationName('当前位置');
                                          }
                                          handleScan(c);
                                          resolve();
                                      } else {
                                  try { window.dispatchEvent(new CustomEvent('amap-geolocate-failed', { detail: { status, result } })); } catch(e) {}
                                  reject(new Error('AMAP_GEOLOCATE_FAILED'));
                              }
                          });
                      } catch (err) { reject(err); }
                  });
              } catch (err) { reject(err); }
          });
          return;
      } catch (e) {
          console.warn('AMap geolocation failed, falling back to browser geolocation', e);
      }

        // Fallback to browser geolocation
        setCurrentApi('Browser Geolocation');
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                    setCoords(c);
                    // Try to use AMap reverse geocoding if AMap can be loaded; otherwise keep a generic label
                        try {
                        const AMap = await loadAMap();
                        reverseGeocodeWithConvert(AMap, c).then((addr) => {
                            if (addr) setLocationName(addr);
                            else setLocationName('当前位置');
                        });
                        } catch (e) {
                        // Could not load AMap for reverse geocoding; fall back to a generic label
                        setLocationName('当前位置');
                        }
                    handleScan(c);
                },
        (err) => {
          console.error("Loc error", err);
          try {
            setToastMessage(`定位失败: ${err?.code || ''} ${err?.message || ''}`);
          } catch(e){}
          // If Geolocation fails, default to Beijing for Demo
          const demoCoords = { latitude: 39.9042, longitude: 116.4074 };
                    setCoords(demoCoords);
                    setLocationName("北京 (演示)");
                    handleScan(demoCoords);
        }
      );
  };

  useEffect(() => {
    // Theme initialization
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Load persisted data
    const savedHistory = localStorage.getItem('travel_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedVoice = localStorage.getItem('voice_pref');
    if (savedVoice) setSelectedVoice(savedVoice);

    const savedUser = localStorage.getItem('user_profile');
    if (savedUser) setUser(JSON.parse(savedUser));

    // Get Location on Init
    refreshLocation();

    // ensure DevAmapPanel is included in the DOM (no-op in production)
    // (Panel is pure React component declared above; will render conditionally in the JSX)

    // Listen to Speech Synthesis events for global playing state
    const synth = window.speechSynthesis;
    const interval = setInterval(() => {
        // Only turn off if not speaking AND not paused
        if (!synth.speaking && !synth.paused && audioState.isPlaying) {
             setAudioState(prev => ({ ...prev, isPlaying: false, isPaused: false, playingItemName: null }));
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [audioState.isPlaying]);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  const handleError = (e: any) => {
    console.warn("Operation failed, likely network or key issue", e);
    // Don't alert aggressively anymore, just rely on UI state or logs
  };

  const handleScan = async (c: Coordinates) => {
    // REMOVED STRICT KEY CHECK to allow Mock Data Fallback
    setScanning(true);
    try {
            setCurrentApi('AMap / Nearby Search');
      const results = await findNearbyLandmarks(c);
      setLandmarks(results);
    } catch (e) {
      handleError(e);
      setLandmarks([]); // Should be covered by mock fallback inside findNearbyLandmarks
    } finally {
      setTimeout(() => setScanning(false), 2000);
            setCurrentApi(null);
    }
  };

  const handleSearch = async (query: string) => {
      setIsSearching(true);
      setSearchQueryForPage(query);
    navigateTo('search_results'); // Navigate immediately
      setSearchResults([]); // Clear previous

      try {
                setCurrentApi('AMap / Search');
                const results = await searchLandmarks(query);
        setSearchResults(results);
      } catch (e) {
          handleError(e);
      } finally {
                    setIsSearching(false);
                    setCurrentApi(null);
      }
  };

  const addToHistory = (landmark: Landmark, text: string) => {
    const newItem: HistoryItem = { ...landmark, timestamp: Date.now(), fullText: text };
    const newHistory = [newItem, ...history.filter(h => h.name !== landmark.name)].slice(20);
    setHistory(newHistory);
    localStorage.setItem('travel_history', JSON.stringify(newHistory));
  };

    const playAudio = async (name: string, id: string, fullLandmark?: Landmark) => {
        // Ensure AudioContext / SpeechSynthesis is unlocked on mobile user gestures
        try { unlockAudioOnUserGesture(); } catch (e) { /* ignore */ }
        // audio debug logs removed
        try {
            // Synchronously trigger a very short (near-silent) SpeechSynthesis utterance
            // during the user gesture so browsers allow later speech playback.
            const synth = window.speechSynthesis;
            if (synth) {
                const u = new SpeechSynthesisUtterance('\u200B');
                try { u.volume = 0; } catch (e) {}
                synth.speak(u);
                setTimeout(() => { try { synth.cancel(); } catch (e) {} }, 50);
            }
        } catch (e) {
            // ignore
        }
        // If no service keys configured, play a local fallback TTS immediately so the
        // user gets audible feedback instead of a silent, unresponsive click.
        if (!hasKeys) {
            try {
                stopAudio();
                const textToSpeak = fullLandmark?.description || `正在播放示例讲解：${name}`;
                const synth = window.speechSynthesis;
                if (synth) {
                    const u = new SpeechSynthesisUtterance(textToSpeak);
                    u.lang = 'zh-CN';
                    try { u.volume = 1; } catch (e) {}
                    synth.speak(u);
                    // Notify user that we're using local fallback
                    try { setToastMessage('使用本地语音回退'); } catch (e) {}
                    audioControlsRef.current = {
                        stop: () => { try { synth.cancel(); } catch (e) {} },
                        pause: () => { try { synth.pause(); } catch (e) {} },
                        resume: () => { try { synth.resume(); } catch (e) {} }
                    };
                    setAudioState({ isPlaying: true, isPaused: false, isLoading: false, currentText: textToSpeak, playingItemName: name });
                } else {
                    // No speechSynthesis available - fallback to a visual hint
                    alert('无法播放语音：当前设备不支持系统语音合成。');
                }
            } catch (e) {
                handleError(e);
            }
            return;
        }
    // 1. Play/Pause Logic if clicking the same item
    if (audioState.playingItemName === name) {
        if (audioState.isPlaying) {
             // Currently playing -> Pause
             if (audioControlsRef.current) audioControlsRef.current.pause();
             setAudioState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
        } else if (audioState.isPaused) {
             // Currently paused -> Resume
             if (audioControlsRef.current) audioControlsRef.current.resume();
             setAudioState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
        }
        return;
    }

    // 2. New Item Logic: Stop current if any
    stopAudio();

    setAudioState({ isPlaying: false, isPaused: false, isLoading: true, currentText: null, playingItemName: name });

        try {
            // debug logs removed
      if (!coords) throw new Error("No coords");

        setCurrentApi('DeepSeek / Audio Generation');
      const result = await generateLandmarkAudio(name, coords, selectedVoice);
            // debug logs removed
      
      // Add to history if it's a main landmark
      if (fullLandmark) {
          addToHistory(fullLandmark, result.text);
      }

    // Play
    // debug logs removed
    result.play();
    // debug logs removed
      audioControlsRef.current = { stop: result.stop, pause: result.pause, resume: result.resume };
      
      setAudioState({ isPlaying: true, isPaused: false, isLoading: false, currentText: result.text, playingItemName: name });

        } catch (e) {
            // debug logs removed
            handleError(e);
            // Attempt local TTS fallback so the UI doesn't feel unresponsive
            try {
                const textToSpeak = fullLandmark?.description || `为您播放 ${name} 的简短介绍`;
                const synth = window.speechSynthesis;
                if (synth) {
                    // debug logs removed
                            try { setToastMessage && setToastMessage('使用本地语音回退'); } catch (e) {}
                    const u = new SpeechSynthesisUtterance(textToSpeak);
                    u.lang = 'zh-CN';
                    try { u.volume = 1; } catch (e2) {}
                    synth.speak(u);
                    audioControlsRef.current = {
                        stop: () => { try { synth.cancel(); } catch (e3) {} },
                        pause: () => { try { synth.pause(); } catch (e3) {} },
                        resume: () => { try { synth.resume(); } catch (e3) {} }
                    };
                    setAudioState({ isPlaying: true, isPaused: false, isLoading: false, currentText: textToSpeak, playingItemName: name });
                    return;
                }
            } catch (e2) {
                // debug logs removed
            }

            // Final: mark as not playing if fallback not possible
            setAudioState({ isPlaying: false, isPaused: false, isLoading: false, currentText: null, playingItemName: null });
        }
  };

  const handleIdentify = async () => {
      // Ensure audio is unlocked on the user gesture that triggers identification + play
      try { unlockAudioOnUserGesture(); } catch (e) {}
      if (!coords) {
          alert("正在获取定位...");
          return;
      }
      setScanning(true);
      try {
          setCurrentApi('Multimodal Identify (DeepSeek/Gemini)');
          const result = await identifyLandmarkFromMultimodal(coords, cameraImage || undefined, userQuery || undefined, selectedVoice);
          
          // Add to Landmarks list as top item
          const newLm = result.landmark;
          setLandmarks(prev => [newLm, ...prev]);
          
          // Auto Play
          addToHistory(newLm, result.text);
          stopAudio(); // Stop previous
          result.play();
          audioControlsRef.current = { stop: result.stop, pause: result.pause, resume: result.resume };

          setAudioState({ 
              isPlaying: true, 
              isPaused: false,
              isLoading: false, 
              currentText: result.text, 
              playingItemName: newLm.name 
          });

          // Reset inputs
          setCameraImage(null);
          setUserQuery('');

      } catch (e) {
          handleError(e);
      } finally {
          setScanning(false);
          setCurrentApi(null);
      }
  };

  const stopAudio = () => {
    if (audioControlsRef.current) {
        audioControlsRef.current.stop();
    }
    window.speechSynthesis.cancel(); // Force cancel
    setAudioState({ isPlaying: false, isPaused: false, isLoading: false, currentText: null, playingItemName: null });
  };

  const handleOpenCamera = async () => {
     try {
         const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
         if (videoRef.current) {
             videoRef.current.srcObject = stream;
             videoRef.current.play();
         }
     } catch (e) {
         console.error("Camera error", e);
         alert("无法访问相机");
     }
  };

  const handleCapture = () => {
      if (videoRef.current && canvasRef.current) {
          const w = videoRef.current.videoWidth;
          const h = videoRef.current.videoHeight;
          canvasRef.current.width = w;
          canvasRef.current.height = h;
          canvasRef.current.getContext('2d')?.drawImage(videoRef.current, 0, 0, w, h);
          const data = canvasRef.current.toDataURL('image/jpeg');
          setCameraImage(data);
          
          // Stop stream
          const stream = videoRef.current.srcObject as MediaStream;
          stream?.getTracks().forEach(t => t.stop());
          videoRef.current.srcObject = null;
      }
  };

  // --- Auth Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: User = {
        id: 'u1', name: '旅行者', email: 'user@example.com', level: 'Lv.3', isVip: true, 
        avatarColor: 'from-blue-500 to-indigo-500', bio: '热爱自由，探索世界'
    };
    setUser(mockUser);
    localStorage.setItem('user_profile', JSON.stringify(mockUser));
    popView();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert("注册成功！请登录");
    navigateTo('login');
  };

  const handleUpdateProfile = (name: string, bio: string) => {
      if (user) {
          const updated = { ...user, name, bio };
          setUser(updated);
          localStorage.setItem('user_profile', JSON.stringify(updated));
          popView();
      }
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('user_profile');
  };

  // --- Navigation Renderers ---

  // Helper to resume/pause play from global player
  const toggleAudio = () => {
      if (audioState.playingItemName) {
          playAudio(audioState.playingItemName!, '');
      }
  };

  const renderContent = () => {
    return (
      <MainRouter
        subPage={subPage}
        activeTab={activeTab}
        coords={coords}
        landmarks={landmarks}
        scanning={scanning}
        audioState={audioState}
        cameraImage={cameraImage}
        setCameraImage={setCameraImage}
        userQuery={userQuery}
        setUserQuery={setUserQuery}
                user={user}
        handleIdentify={handleIdentify}
        handleOpenCamera={handleOpenCamera}
        videoRef={videoRef}
        canvasRef={canvasRef}
        handleCapture={handleCapture}
        onLandmarkClick={(lm) => { navigateTo('landmark_detail', { currentLandmark: lm }); }}
        onCategoryClick={(cat) => { navigateTo('category_list', { activeCategory: cat }); }}
        onSearch={handleSearch}
        onRefreshLocation={refreshLocation}
        locationName={locationName}
        hasKeys={hasKeys}
        onSetupKeys={() => { navigateTo('api_key_settings', { activeTab: 'profile' }); }}
        searchQueryForPage={searchQueryForPage}
        searchResults={searchResults}
        isSearching={isSearching}
        navigateTo={navigateTo}
                popView={() => {
                    try {
                        const snap = popView();
                        if (snap) {
                            try { setActiveTab((snap as any).activeTab ?? 'home'); } catch (e) {}
                            try { setSubPage((snap as any).subPage ?? null); } catch (e) {}
                            try { setCurrentLandmark((snap as any).currentLandmark ?? null); } catch (e) {}
                            try { setActiveCategory((snap as any).activeCategory ?? 'attractions'); } catch (e) {}
                        } else {
                            // No snapshot: just clear subPage and go to activeTab home
                            setSubPage(null);
                        }
                    } catch (e) {
                        console.warn('popView wrapper failed', e);
                        setSubPage(null);
                    }
                }}
        stopAudio={stopAudio}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleUpdateProfile={handleUpdateProfile}
        handleLogout={handleLogout}
        setSelectedVoice={setSelectedVoice}
        selectedVoice={selectedVoice}
        history={history}
        addToHistory={addToHistory}
        setShowDonation={setShowDonation}
        setActiveTab={setActiveTab}
        setCurrentLandmark={setCurrentLandmark}
        currentLandmark={currentLandmark}
        playAudio={playAudio}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
      />
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen relative font-sans transition-colors duration-300">
      
      {/* Main Content Area */}
      <div>
         {renderContent()}
      </div>

            {/* Toast for fallback notifications */}
            {toastMessage && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[160] bg-black/80 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
                    {toastMessage}
                </div>
            )}

            {/* Gemini leaked-key modal */}
            {geminiLeaked && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 px-4">
                    <div className="max-w-lg w-full bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">检测到 Gemini API Key 问题</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{geminiLeakedMsg || '检测到您使用的 Gemini API Key 已被报告泄露或撤销。为保证服务可用，请尽快更换 API Key。'}</p>
                        <div className="flex gap-3">
                            <button onClick={() => { setGeminiLeaked(false); navigateTo('api_key_settings', { activeTab: 'profile' }); }} className="flex-1 py-3 bg-teal-600 text-white rounded-xl">去设置</button>
                            <button onClick={() => { setGeminiLeaked(false); sessionStorage.setItem('GEMINI_LEAK_IGNORED', '1'); }} className="flex-1 py-3 border rounded-xl">忽略</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global audio debug UI removed */}

      {/* Global Components */}
      <GlobalAudioPlayer 
          audioState={audioState} 
          onTogglePlay={toggleAudio}
          onStop={stopAudio}
      />
      
      {showDonation && <DonationModal onClose={() => setShowDonation(false)} />}

            {/* Dev-only navStack inspector */}
            {((import.meta as any).env?.DEV) && (
                <div className="fixed right-4 bottom-32 z-[200]">
                    <button onClick={() => { console.log('navStack snapshot', navStack); alert('navStack length: ' + navStack.length); }} className="px-3 py-2 bg-black/70 text-white rounded-md text-sm">Dev: Log navStack ({navStack.length})</button>
                </div>
            )}

            {/* Current API badge (left-bottom) */}
            {currentApi && (
                <div className="fixed left-4 bottom-20 z-[200] pointer-events-none">
                    <div className="px-3 py-1 rounded-md bg-black/70 text-white text-xs shadow-lg">
                        当前调用: {currentApi}
                    </div>
                </div>
            )}

      {/* Bottom Navigation Bar */}
      {!subPage && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-safe pt-2 px-6 flex justify-around z-50">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'home' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
            <MapIcon active={activeTab === 'home'} />
            <span className="text-[10px] font-bold mt-1">探索</span>
          </button>
          
          <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 self-center"></div>

          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'profile' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
            <UserIcon active={activeTab === 'profile'} />
            <span className="text-[10px] font-bold mt-1">我的</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Wrap core app with NavProvider so components can use navigation context
const WrappedApp: React.FC = () => (
    <NavProvider>
        <AppProvider>
            <AppCore />
        </AppProvider>
    </NavProvider>
);

export default WrappedApp;