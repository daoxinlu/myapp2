import React, { useState } from 'react';
import { Coordinates, Landmark, AudioState, User } from '../types';
import LandmarkDetailPage from './LandmarkDetailPage';
import SearchResultsPage from './SearchResultsPage';
import CategoryListPage from './CategoryListPage';
import HomeView from './HomeView';
import ProfileView from './ProfileView';
import { BackIcon } from './icons';
import { getKeys, setAmapKeys, setDeepseekKey, setGeminiKey } from '../services/geminiService';

type SubPageLocal = 'landmark_detail' | 'search_results' | 'category_list' | 'login' | 'register' | 'edit_profile' | 'api_key_settings' | 'voice_settings' | 'history' | null;

interface Props {
  subPage: SubPageLocal;
  activeTab: 'home'|'profile';
  coords: Coordinates | null;
  landmarks: Landmark[];
  scanning: boolean;
  audioState: AudioState;
  cameraImage: string | null;
  setCameraImage: (img: string | null) => void;
  userQuery: string;
  setUserQuery: (q: string) => void;
  handleIdentify: () => void;
  handleOpenCamera: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  handleCapture: () => void;
  onLandmarkClick: (lm: Landmark) => void;
  onCategoryClick: (category: string) => void;
  onSearch: (query: string) => void;
  onRefreshLocation: () => void;
  locationName: string;
  hasKeys: boolean;
  onSetupKeys: () => void;

  // search
  searchQueryForPage: string;
  searchResults: Landmark[];
  isSearching: boolean;

  // navigation helpers
  navigateTo: (p: SubPageLocal, opts?: any) => void;
  popView: () => void;
  stopAudio: () => void;

  // auth/profile handlers
  handleLogin: (e: any) => void;
  handleRegister: (e: any) => void;
  handleUpdateProfile: (name: string, bio: string) => void;
  handleLogout: () => void;

  setSelectedVoice: (id: string) => void;
  selectedVoice?: string;

  history: any[];
  addToHistory: (l: Landmark, text: string) => void;
  setShowDonation: (val: boolean) => void;
  setActiveTab: (t: 'home'|'profile') => void;
  setCurrentLandmark: (lm: Landmark | null) => void;
  playAudio?: (name: string, id: string, fullLandmark?: Landmark) => void;
  currentLandmark?: Landmark | null;
  user?: User | null;
}

const MainRouter: React.FC<Props> = (props) => {
  const {
    subPage, activeTab, coords, landmarks, scanning, audioState,
    cameraImage, setCameraImage, userQuery, setUserQuery, handleIdentify,
    handleOpenCamera, videoRef, canvasRef, handleCapture, onLandmarkClick,
    onCategoryClick, onSearch, onRefreshLocation, locationName, hasKeys,
    onSetupKeys, searchQueryForPage, searchResults, isSearching,
    navigateTo, popView, stopAudio, handleLogin, handleRegister,
    handleUpdateProfile, handleLogout, setSelectedVoice, selectedVoice,
    history, addToHistory, setShowDonation, setActiveTab, setCurrentLandmark
  } = props;

  // Inline simple pages (moved from App.tsx)
  if (subPage === 'landmark_detail' && (props as any).currentLandmark) {
    const lm = (props as any).currentLandmark as Landmark;
    return (
      <div className="relative scrollbar-hide">
        <div className="fixed top-6 left-4 z-[260] pointer-events-auto">
          <button type="button" onClick={() => { stopAudio(); popView(); }} className="p-2 rounded-full bg-black/30 backdrop-blur text-white shadow-lg">
            <BackIcon />
          </button>
        </div>
        <LandmarkDetailPage
          landmark={lm}
          audioState={audioState}
          user={props.user || null}
          onPlayGuide={(name: string, id: string, full?: Landmark) => { if (props.playAudio) props.playAudio(name, id, full); }}
          onUpdateLandmark={(updated) => { setCurrentLandmark(updated); }}
          onStopAudio={stopAudio}
        />
      </div>
    );
  }

  if (subPage === 'search_results') {
    return (
      <SearchResultsPage
        query={searchQueryForPage}
        results={searchResults}
        loading={isSearching}
        onBack={() => { stopAudio(); popView(); }}
        onSelect={(lm) => { navigateTo('landmark_detail', { currentLandmark: lm }); }}
      />
    );
  }

  if (subPage === 'category_list') {
    return <CategoryListPage category={(props as any).activeCategory || 'attractions'} onBack={() => { stopAudio(); popView(); }} />;
  }

  if (subPage === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 pb-6 pt-16 flex flex-col justify-center animate-fadeIn scrollbar-hide">
        <button onClick={() => { stopAudio(); popView(); }} className="absolute top-10 left-6 text-slate-400"><BackIcon /></button>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">欢迎回来</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="账号/手机号" className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 ring-teal-500 outline-none dark:text-white" required />
          <input type="password" placeholder="密码" className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 ring-teal-500 outline-none dark:text-white" required />
          <button type="submit" className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200 dark:shadow-teal-900/30">登录</button>
        </form>
        <p className="mt-6 text-center text-slate-500">还没有账号？ <span onClick={() => navigateTo('register')} className="text-teal-600 font-bold cursor-pointer">立即注册</span></p>
      </div>
    );
  }

  if (subPage === 'register') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 pb-6 pt-16 flex flex-col justify-center animate-fadeIn scrollbar-hide">
        <button onClick={() => { stopAudio(); popView(); }} className="absolute top-10 left-6 text-slate-400"><BackIcon /></button>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">创建账号</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="昵称" className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" required />
          <input type="text" placeholder="手机号" className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" required />
          <input type="password" placeholder="设置密码" className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" required />
          <button type="submit" className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg">注册</button>
        </form>
      </div>
    );
  }

  if (subPage === 'edit_profile') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 pb-6 pt-16 animate-fadeIn scrollbar-hide">
        <div className="flex items-center mb-8">
          <button onClick={() => { stopAudio(); popView(); }} className="mr-4 text-slate-500"><BackIcon /></button>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">编辑资料</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); const form = e.target as HTMLFormElement; handleUpdateProfile((form.username as any).value, (form.bio as any).value); }} className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-tr from-gray-400 to-gray-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-slate-800 shadow-xl`}>?
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-2">昵称</label>
            <input name="username" defaultValue={''} className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-2">个性签名</label>
            <textarea name="bio" defaultValue={''} className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" rows={3} />
          </div>
          <button type="submit" className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg">保存修改</button>
        </form>
      </div>
    );
  }

  if (subPage === 'api_key_settings') {
    const k = getKeys();
    const [amapKey, setAmapKey] = useState<string>(k.amapKey || '');
    const [amapSecret, setAmapSecret] = useState<string>(k.amapSecret || '');
    const [deepseekKey, setDeepseekKeyLocal] = useState<string>(k.llmKey || '');
    const [geminiKeyLocal, setGeminiKeyLocal] = useState<string>(k.geminiKey || '');
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 pb-6 pt-16 animate-fadeIn scrollbar-hide">
        <div className="flex items-center mb-8">
          <button onClick={() => { stopAudio(); popView(); }} className="mr-4 text-slate-500"><BackIcon /></button>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">API Key 设置</h2>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 border-b pb-4 dark:border-slate-700">请至少配置一组服务 Key。</p>
            <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">高德地图 Key (Web端/JSAPI)</label>
              <input value={amapKey} onChange={(e) => setAmapKey(e.target.value)} type="text" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">高德安全密钥 (Security Code)</label>
              <input value={amapSecret} onChange={(e) => setAmapSecret(e.target.value)} type="password" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">DeepSeek API Key</label>
              <input value={deepseekKey} onChange={(e) => setDeepseekKeyLocal(e.target.value)} type="password" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white text-sm" />
            </div>
          </div>
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Gemini API Key</label>
              <input value={geminiKeyLocal} onChange={(e) => setGeminiKeyLocal(e.target.value)} type="password" placeholder={(import.meta as any).env?.VITE_API_KEY ? "已自动配置 (默认)" : "输入 API Key"} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white text-sm" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={() => { stopAudio();
                // apply keys into the runtime key manager (in-memory)
                setAmapKeys(amapKey, amapSecret);
                setDeepseekKey(deepseekKey);
                setGeminiKey(geminiKeyLocal);
                popView();
             }} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-bold shadow-lg w-full">保存配置并返回</button>
          </div>
        </div>
      </div>
    );
  }

  if (subPage === 'voice_settings') {
    const voices = [
      { id: 'Fenrir', name: '沉稳男声', desc: '适合历史古迹讲解' },
      { id: 'Puck', name: '知性女声', desc: '适合博物馆导览' },
      { id: 'Kore', name: '亲切女声', desc: '适合自然风光介绍' },
      { id: 'Charon', name: '磁性男声', desc: '适合夜游导览' },
    ];
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 pb-6 pt-16 animate-fadeIn scrollbar-hide">
        <div className="flex items-center mb-8">
          <button onClick={() => popView()} className="mr-4 text-slate-500"><BackIcon /></button>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">语音讲解偏好</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4 px-1">注: 当前使用系统语音合成，音色取决于您的设备。</p>
        <div className="space-y-4">
          {voices.map(v => (
            <button key={v.id} onClick={() => { setSelectedVoice(v.id); localStorage.setItem('voice_pref', v.id); }} className={`w-full p-4 rounded-xl flex items-center justify-between border transition-all ${selectedVoice === v.id ? 'bg-teal-50 border-teal-500 shadow-sm dark:bg-teal-900/20' : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700'}`}>
              <div className="text-left">
                <div className={`font-bold ${selectedVoice === v.id ? 'text-teal-700 dark:text-teal-400' : 'text-slate-800 dark:text-white'}`}>{v.name}</div>
                <div className="text-xs text-slate-500 mt-1">{v.desc}</div>
              </div>
              {selectedVoice === v.id && (<div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg></div>)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (subPage === 'history') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 pb-6 pt-16 animate-fadeIn scrollbar-hide">
        <div className="flex items-center mb-8">
          <button onClick={() => popView()} className="mr-4 text-slate-500"><BackIcon /></button>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">历史讲解记录</h2>
        </div>
        <div className="space-y-6 relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 pl-6">
          {history.length === 0 && <p className="text-slate-400">暂无记录</p>}
          {history.map((h, i) => (
            <div key={i} className="relative cursor-pointer group" onClick={() => { navigateTo('landmark_detail', { currentLandmark: h }); }}>
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-teal-500 border-4 border-white dark:border-slate-900"></div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:border-teal-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 dark:text-white">{h.name}</h4>
                  <span className="text-xs text-slate-400">{new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{h.fullText || h.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: Home or Profile Tab
  if (activeTab === 'home') {
    return (
      <HomeView
        coords={coords}
        landmarks={landmarks}
        scanning={scanning}
        audioState={audioState}
        cameraImage={cameraImage}
        setCameraImage={setCameraImage}
        userQuery={userQuery}
        setUserQuery={setUserQuery}
        handleIdentify={handleIdentify}
        handleOpenCamera={handleOpenCamera}
        videoRef={videoRef}
        canvasRef={canvasRef}
        handleCapture={handleCapture}
        onLandmarkClick={onLandmarkClick}
        onCategoryClick={onCategoryClick}
        onSearch={onSearch}
        onRefreshLocation={onRefreshLocation}
        locationName={locationName}
        hasKeys={hasKeys}
        onSetupKeys={onSetupKeys}
      />
    );
  } else {
    return (
      <ProfileView
        user={props.user || null}
        isDarkMode={false}
        toggleTheme={() => {}}
        setSubPage={(p: any) => navigateTo(p)}
        setShowDonation={setShowDonation}
        handleLogout={handleLogout}
      />
    );
  }
};

export default MainRouter;
