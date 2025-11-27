import { Coordinates, Landmark, SubAttraction } from "../types";

// The @google/genai module is optionally imported at runtime inside callGemini.
// Ambient declaration for it is provided in `global.d.ts` to keep builds working
// when the package is not installed.

/**
 * CONFIGURATION MANAGEMENT
 */
const getKeys = () => {
  return {
    amapKey: localStorage.getItem("AMAP_KEY") || "",
    amapSecret: localStorage.getItem("AMAP_SECRET") || "",
    llmKey: localStorage.getItem("DEEPSEEK_KEY") || "",
    // Priority: LocalStorage -> Environment Variable (Auto-config)
        geminiKey: localStorage.getItem("GEMINI_API_KEY") || (import.meta as any).env?.VITE_API_KEY || ""
  };
};

const hasDomesticKeys = () => {
    const { amapKey, amapSecret, llmKey } = getKeys();
    return !!(amapKey && amapSecret && llmKey);
};

// --- Mock Data for Fallback ---
const MOCK_LANDMARKS: Landmark[] = [
    { id: 'm1', name: '天安门广场', description: '世界上最大的城市中心广场，是北京的心脏地带，可容纳100万人举行盛大集会。', distance: '500m', type: '著名景点' },
    { id: 'm2', name: '国家博物馆', description: '中华文物收藏量最丰富的博物馆，记载着中华民族五千年的文明历史。', distance: '800m', type: '博物馆' },
    { id: 'm3', name: '故宫博物院', description: '中国明清两代的皇家宫殿，旧称紫禁城，是世界上现存规模最大、保存最完整的木质结构古建筑之一。', distance: '1.2km', type: '世界遗产' },
    { id: 'm4', name: '景山公园', description: '位于故宫北面，是元、明、清三代的御苑，山顶可俯瞰故宫全景。', distance: '1.5km', type: '公园' },
    { id: 'm5', name: '王府井大街', description: '具有数百年悠久历史的商业街，聚集了众多中华老字号和现代商场。', distance: '2.0km', type: '商业街' }
];

// --- AMap Loader Helper ---
let amapLoaded = false;
const loadAMap = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (amapLoaded && (window as any).AMap) {
      resolve((window as any).AMap);
      return;
    }

    const { amapKey, amapSecret } = getKeys();
    if (!amapKey || !amapSecret) {
      reject(new Error("AMAP_KEY_MISSING"));
      return;
    }

    // Set Security Config
    (window as any)._AMapSecurityConfig = {
      securityJsCode: amapSecret,
    };

    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&plugin=AMap.PlaceSearch,AMap.Geocoder`;
    script.async = true;
    script.onload = () => {
      amapLoaded = true;
      resolve((window as any).AMap);
    };
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

// --- LLM Helper (DeepSeek) ---
const callDeepSeek = async (systemPrompt: string, userPrompt: string): Promise<string> => {
    const { llmKey } = getKeys();
    if (!llmKey) throw new Error("LLM_KEY_MISSING");

    try {
        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${llmKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`LLM API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    } catch (e) {
        console.warn("DeepSeek call failed", e);
        return "";
    }
};

// --- Gemini Fallback Helper ---
const callGemini = async (prompt: string | any, model: string = "gemini-2.5-flash", config: any = {}) => {
    const { geminiKey } = getKeys();
    if (!geminiKey) throw new Error("GEMINI_KEY_MISSING");

    try {
        // Dynamically import @google/genai only when needed. This avoids a hard dependency at build time
        // so projects that don't install the package can still build and use fallback logic.
        let GoogleGenAI: any = null;
        try {
            // Import from a CDN at runtime. Use `@vite-ignore` so Vite does not try
            // to resolve or pre-bundle this import during dev; the browser will
            // load it directly from the CDN (esm.sh).
            const mod = await import(/* @vite-ignore */ 'https://esm.sh/@google/genai');
            GoogleGenAI = mod.GoogleGenAI || mod.default || mod;
        } catch (impErr) {
            console.warn('Could not import @google/genai module dynamically from CDN', impErr);
            throw new Error('GEMINI_MODULE_MISSING');
        }

        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config
        });
        return response;
    } catch (e) {
        console.warn("Gemini call failed", e);
        throw e;
    }
};

/**
 * Find Nearby Landmarks
 * Priority: AMap -> Gemini (Google Maps) -> Gemini (Text) -> Mock Data
 */
export const findNearbyLandmarks = async (coords: Coordinates): Promise<Landmark[]> => {
  // 1. Try AMap
  if (hasDomesticKeys()) {
      try {
        const AMap = await loadAMap();
        return new Promise((resolve) => {
            const placeSearch = new AMap.PlaceSearch({ 
                type: '风景名胜|公园广场|文物古迹', 
                pageSize: 10,
                pageIndex: 1,
                extensions: 'all'
            });

            placeSearch.searchNearBy('', [coords.longitude, coords.latitude], 3000, (status: string, result: any) => {
                if (status === 'complete' && result.info === 'OK') {
                    const pois = result.poiList.pois;
                    const landmarks: Landmark[] = pois.map((poi: any) => ({
                        id: poi.id,
                        name: poi.name,
                        description: poi.type || "暂无简介",
                        distance: `${poi.distance}米`,
                        type: poi.type.split(';')[0]
                    }));
                    resolve(landmarks);
                } else {
                    resolve([]); // AMap returned empty, try fallback?
                }
            });
        });
      } catch (e) {
          console.warn("AMap failed, falling back to Gemini", e);
      }
  }

  // 2. Fallback to Gemini
  try {
      const response = await callGemini(
          "Find 5 popular tourist landmarks near this location.",
          "gemini-2.5-flash",
          {
             tools: [{ googleMaps: {} }],
             toolConfig: { retrievalConfig: { latLng: { latitude: coords.latitude, longitude: coords.longitude } } }
          }
      );
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const landmarks: Landmark[] = [];
      
      chunks.forEach((chunk: any, index: number) => {
          if (chunk.web?.title) {
              landmarks.push({
                  id: `g-${index}`,
                  name: chunk.web.title,
                  description: "Google Maps 推荐景点",
                  distance: "附近",
                  type: "景点"
              });
          }
      });
      
      // If we got some landmarks via Google Maps grounding, return them
      if (landmarks.length > 0) return landmarks;

  } catch (e) {
      console.warn("Gemini Nearby Search failed", e);
  }

  // 4. Final Fallback: Mock Data
  console.log("Using Mock Data for Landmarks");
  return MOCK_LANDMARKS;
};

/**
 * Search Location / Landmarks
 * Returns a list of potential matches.
 */
export const searchLandmarks = async (query: string): Promise<Landmark[]> => {
    // 1. Try AMap
    if (hasDomesticKeys()) {
        try {
            const AMap = await loadAMap();
            return new Promise((resolve) => {
                const placeSearch = new AMap.PlaceSearch({ pageSize: 10, extensions: 'all' });
                placeSearch.search(query, (status: string, result: any) => {
                    if (status === 'complete' && result.info === 'OK') {
                        const pois = result.poiList.pois;
                        const landmarks: Landmark[] = pois.map((poi: any) => ({
                            id: poi.id,
                            name: poi.name,
                            description: poi.address || poi.type || "暂无简介",
                            distance: "搜索结果",
                            type: poi.type.split(';')[0]
                        }));
                        resolve(landmarks);
                    } else {
                        resolve([]);
                    }
                });
            });
        } catch (e) { console.warn("AMap Search failed", e); }
    }

    // 2. Gemini Fallback
    try {
        const textResp = await callGemini(`Search for landmarks matching "${query}". Return JSON array: [{"name":"Name", "description":"Desc", "type":"Type"}]`);
        const json = textResp.text?.match(/\[.*\]/s)?.[0];
        if (json) {
            const list = JSON.parse(json);
            return list.map((l: any, i: number) => ({
                id: `gem-search-${i}`,
                name: l.name,
                description: l.description,
                type: l.type,
                distance: "未知"
            }));
        }
    } catch(e) {}

    // 3. Mock Data Fallback
    return [
        { id: 's1', name: `${query} (模拟结果)`, description: '这是模拟的搜索结果，因为未配置国内API。', type: '模拟', distance: '-' },
        { id: 's2', name: '周边推荐景点', description: '相关联的推荐地点', type: '推荐', distance: '-' }
    ];
};

/**
 * Search Location (Single Point for relocation)
 */
export const searchLocation = async (query: string): Promise<{ coords: Coordinates, address: string } | null> => {
    // 1. Try AMap
    if (hasDomesticKeys()) {
        try {
            const AMap = await loadAMap();
            return new Promise((resolve) => {
                const placeSearch = new AMap.PlaceSearch({ pageSize: 1 });
                placeSearch.search(query, (status: string, result: any) => {
                    if (status === 'complete' && result.info === 'OK' && result.poiList.pois.length > 0) {
                        const poi = result.poiList.pois[0];
                        resolve({
                            coords: { latitude: poi.location.lat, longitude: poi.location.lng },
                            address: poi.address || poi.name
                        });
                    } else {
                        resolve(null);
                    }
                });
            });
        } catch (e) { console.warn("AMap Search failed", e); }
    }

    // 2. Gemini
    try {
        const textResp = await callGemini(`Return the latitude and longitude of "${query}" in JSON format: {"latitude": number, "longitude": number}`);
        const json = textResp.text?.match(/\{.*\}/s)?.[0];
        if (json) {
            const coords = JSON.parse(json);
            if (coords.latitude && coords.longitude) {
                return { coords, address: query };
            }
        }
    } catch(e) { console.error(e); }

    // 3. Mock Location
    if (query.includes("故宫") || query.includes("北京")) {
        return { coords: { latitude: 39.9163, longitude: 116.3972 }, address: "北京市东城区 (演示)" };
    }

    return null;
};

/**
 * Fetch Sub Attractions
 */
export const fetchSubAttractions = async (landmarkName: string): Promise<SubAttraction[]> => {
    const prompt = `列出"${landmarkName}"内部的3-5个著名具体景观。返回JSON数组: [{"name":"景观名","description":"简短介绍","type":"类型"}]`;
    
    let text = "";
    if (hasDomesticKeys()) {
        try {
            text = await callDeepSeek("你是一个导游助手。", prompt);
        } catch (e) { console.warn("DeepSeek failed"); }
    }
    
    if (!text) {
        try {
            const res = await callGemini(prompt);
            text = res.text || "";
        } catch (e) { console.warn("Gemini SubAttractions failed"); }
    }

    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]).map((item: any, i: number) => ({
                id: `sub-${i}-${Date.now()}`,
                name: item.name,
                description: item.description,
                type: item.type
            }));
        } catch (e) {}
    }
    
    // Mock Sub Attractions if failed
    return [
        { id: 's1', name: '主要殿堂', description: '这里是景点的核心区域，建筑宏伟。', type: '建筑' },
        { id: 's2', name: '花园区', description: '景色宜人，适合休憩。', type: '园林' }
    ];
};

/**
 * Generate Audio Guide
 */
export const generateLandmarkAudio = async (
  landmarkName: string, 
  userCoords: Coordinates,
  voiceName: string = 'Fenrir'
): Promise<{ text: string; play: () => void; stop: () => void; pause: () => void; resume: () => void }> => {
    
    const systemPrompt = "你是一位专业导游。";
    const userPrompt = `为“${landmarkName}”写一段100字左右的生动口语讲解词。`;
    
    let scriptText = "";

    // 1. Try DeepSeek
    if (hasDomesticKeys()) {
        try {
            scriptText = await callDeepSeek(systemPrompt, userPrompt);
        } catch (e) { console.warn("DeepSeek failed"); }
    }

    // 2. Try Gemini
    if (!scriptText) {
        try {
            const res = await callGemini(systemPrompt + " " + userPrompt);
            scriptText = res.text || "";
        } catch (e) { 
             // 3. Fallback Text
            scriptText = `欢迎来到${landmarkName}。这是一个非常值得游览的地方，拥有悠久的历史和独特的文化魅力。请您尽情欣赏这里的美景。`;
        }
    }

    // 3. Play using Web Speech API (Universal)
    const synth = window.speechSynthesis;
    
    const play = () => {
        if (synth.speaking && !synth.paused) synth.cancel();
        const utterance = new SpeechSynthesisUtterance(scriptText);
        utterance.lang = 'zh-CN';
        synth.speak(utterance);
    };

    return { 
        text: scriptText, 
        play, 
        stop: () => synth.cancel(),
        pause: () => synth.pause(),
        resume: () => synth.resume()
    };
};

/**
 * Multimodal Identification
 */
export const identifyLandmarkFromMultimodal = async (
    coords: Coordinates,
    imageBase64?: string,
    userQuery?: string,
    voiceName: string = 'Fenrir'
): Promise<{ landmark: Landmark; text: string; play: () => void; stop: () => void; pause: () => void; resume: () => void }> => {
    
    // Strategy A: Domestic (Location + LLM)
    if (hasDomesticKeys() && !imageBase64) {
        // ... (Existing logic: Reverse Geo -> DeepSeek) ...
        let locationContext = "未知位置";
        try {
            const AMap = await loadAMap();
            await new Promise<void>((resolve) => {
                const geocoder = new AMap.Geocoder();
                geocoder.getAddress([coords.longitude, coords.latitude], (status: string, result: any) => {
                    if (status === 'complete' && result.regeocode) {
                        locationContext = result.regeocode.formattedAddress;
                        if(result.regeocode.pois && result.regeocode.pois.length > 0) locationContext += `，紧邻${result.regeocode.pois[0].name}`;
                    }
                    resolve();
                });
            });
            const prompt = `我在${locationContext}。${userQuery || '这是什么？'} 请返回JSON: {"name":"", "description":"", "type":"", "script":""}`;
            const text = await callDeepSeek("你是一个导游。", prompt);
            const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
            
            const landmark = { id: `id-${Date.now()}`, name: json.name || "未知", description: json.description, type: json.type, distance: "当前" };
            const audio = await generateLandmarkAudio(landmark.name, coords);
            
            const play = () => {
                 const u = new SpeechSynthesisUtterance(json.script || audio.text);
                 u.lang = 'zh-CN';
                 window.speechSynthesis.speak(u);
            }
            return { 
                landmark, 
                text: json.script || audio.text, 
                play, 
                stop: () => window.speechSynthesis.cancel(),
                pause: () => window.speechSynthesis.pause(),
                resume: () => window.speechSynthesis.resume()
            };

        } catch (e) { console.warn("Domestic ID failed"); }
    }

    // Strategy B: Gemini Multimodal (Supports Image!)
    try {
        const parts: any[] = [];
        if (imageBase64) {
            const b64 = imageBase64.split(',')[1];
            parts.push({ inlineData: { mimeType: 'image/jpeg', data: b64 } });
        }
        parts.push({ text: `I am at lat:${coords.latitude}, lng:${coords.longitude}. ${userQuery || "Identify this landmark or place."} Return JSON: {"name": "Chinese Name", "description": "Short desc", "type": "Type", "script": "Chinese audio script"}` });

        const res = await callGemini({ parts }, "gemini-2.5-flash");
        const text = res.text || "{}";
        const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
        
        const landmark = { id: `id-${Date.now()}`, name: json.name || "识别结果", description: json.description || "Gemini识别", type: json.type || "景点", distance: "当前" };
        
        const play = () => {
             const u = new SpeechSynthesisUtterance(json.script || "无法生成语音");
             u.lang = 'zh-CN';
             window.speechSynthesis.speak(u);
        }

        return { 
            landmark, 
            text: json.script || "", 
            play, 
            stop: () => window.speechSynthesis.cancel(),
            pause: () => window.speechSynthesis.pause(),
            resume: () => window.speechSynthesis.resume()
        };

    } catch (e) {
        console.error("Gemini Multimodal failed", e);
        
        const mockName = userQuery?.includes("塔") ? "古塔" : "未知景点";
        const mockText = "识别服务暂时不可用，但这个地方看起来很有历史感。";
        return { 
            landmark: { id: 'err', name: mockName, description: '自动识别演示', distance: '当前', type: '识别' }, 
            text: mockText, 
            play: () => {
                 const u = new SpeechSynthesisUtterance(mockText);
                 u.lang = 'zh-CN';
                 window.speechSynthesis.speak(u);
            }, 
            stop: () => window.speechSynthesis.cancel(),
            pause: () => window.speechSynthesis.pause(),
            resume: () => window.speechSynthesis.resume()
        };
    }
};