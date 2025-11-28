import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd-mobile';
import { Coordinates, Landmark, AudioState, SubAttraction } from './types';
import { findNearbyLandmarks, generateLandmarkAudio, identifyLandmarkFromMultimodal, fetchSubAttractions, searchLocation, searchLandmarks, loadAMap } from './services/geminiService';
import { unlockAudioOnUserGesture, ensureAudioUnlockedNow } from './utils/audioUtils';
import Radar from './components/Radar';

// --- Types ---
type SubPage = 'history' | 'voice_settings' | 'landmark_detail' | 'login' | 'register' | 'edit_profile' | 'category_list' | 'api_key_settings' | 'search_results' | null;

interface HistoryItem extends Landmark {
  timestamp: number;
  fullText?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  level: string; // Lv.1
  isVip: boolean;
  avatarColor: string;
  bio?: string;
}

interface Review {
  id: string;
  user: string;
  avatarColor: string;
  rating: number;
  text: string;
  date: string;
}

// --- Icons (Same as before) ---
const MapIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const UserIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LocationArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);

const GpsFixedIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 14v1m7-8h1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const AlipayIcon = () => (
  <svg viewBox="0 0 1024 1024" className="w-5 h-5 mr-2" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M785.4 724.7C745.2 841 645 922.3 512.4 922.3c-154.6 0-264-106.3-264-263.1 0-165.2 119-270.8 284-270.8 77.1 0 134.1 21.2 173 53.6l-39.2 68.9c-35-26.7-79.6-43.2-132.8-43.2-111.9 0-189.2 73.1-189.2 189.5 0 102.7 66.7 172.9 174.9 172.9 76.6 0 138-42.3 167.3-112.5H516v-78h273.6c2.8 27.6 4.3 56.4 4.3 85.1 0 0-8.5 0-8.5 0zM889.3 274.6h-178V166h-94.2v108.6H392.5v79.1h224.6c-13.6 57.1-43.1 106.9-82.6 148.6-33.1-34.6-58.8-75.1-76.3-120.3h-88c22.6 63.8 58.8 120.3 105.7 167.3-64.4 62.4-142.9 100.9-242 107.5l-22.3 84.8c122.9-13.6 222.9-63.5 301.1-140.7 54.2 56.5 120.6 98.6 193.2 122.6l42.6-83.3c-58.2-18.1-111.3-49.7-156.8-93.5 53.4-53.4 91.5-116.9 111-184.7h186.5v-88.1z" />
  </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);

const CloudIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
);

const CameraIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

const SendIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);

const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
);

const StarIcon: React.FC<{ filled: boolean, onClick?: () => void }> = ({ filled, onClick }) => (
  <svg 
    onClick={onClick} 
    className={`w-3.5 h-3.5 ${filled ? 'text-orange-400' : 'text-slate-300 dark:text-slate-600'} ${onClick ? 'cursor-pointer transform hover:scale-110 transition-transform' : ''}`} 
    fill="currentColor" 
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// --- Components ---

interface GlobalAudioPlayerProps {
    audioState: AudioState;
    onTogglePlay: () => void;
    onStop: () => void;
}

const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = ({ audioState, onTogglePlay, onStop }) => {
    if (!audioState.isPlaying && !audioState.isPaused) return null;

    return (
            <div className="fixed bottom-20 left-4 right-4 z-[60] animate-fadeIn">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                {/* Visualizer / Icon */}
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    {audioState.isPlaying ? (
                        <div className="flex gap-0.5 h-4 items-end">
                            <div className="w-0.5 h-full bg-white animate-[bounce_1s_infinite]"></div>
                            <div className="w-0.5 h-2/3 bg-white animate-[bounce_1.2s_infinite]"></div>
                            <div className="w-0.5 h-full bg-white animate-[bounce_0.8s_infinite]"></div>
                        </div>
                    ) : (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0" onClick={onTogglePlay}>
                    <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                        {audioState.isPaused ? "已暂停" : "正在讲解"}
                    </div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {audioState.playingItemName || "未知景点"}
                    </div>
                </div>

                {/* Controls */}
                    <div className="flex items-center gap-2">
                    <button 
                        onPointerDown={() => { try { ensureAudioUnlockedNow(); unlockAudioOnUserGesture(); } catch (e){} }}
                        onTouchStart={() => { try { ensureAudioUnlockedNow(); unlockAudioOnUserGesture(); } catch (e){} }}
                        onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        {audioState.isPlaying ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        )}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onStop(); }}
                        className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

interface DonationModalProps {
  onClose: () => void;
}

const DonationModal: React.FC<DonationModalProps> = ({ onClose }) => {
  const [amount, setAmount] = useState<number>(5);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handlePayment = async () => {
    setStatus('processing');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e) {
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl transform transition-all border border-slate-100 dark:border-slate-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#1677FF] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#1677FF]">
             <svg viewBox="0 0 1024 1024" className="w-8 h-8" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M785.4 724.7C745.2 841 645 922.3 512.4 922.3c-154.6 0-264-106.3-264-263.1 0-165.2 119-270.8 284-270.8 77.1 0 134.1 21.2 173 53.6l-39.2 68.9c-35-26.7-79.6-43.2-132.8-43.2-111.9 0-189.2 73.1-189.2 189.5 0 102.7 66.7 172.9 174.9 172.9 76.6 0 138-42.3 167.3-112.5H516v-78h273.6c2.8 27.6 4.3 56.4 4.3 85.1 0 0-8.5 0-8.5 0zM889.3 274.6h-178V166h-94.2v108.6H392.5v79.1h224.6c-13.6 57.1-43.1 106.9-82.6 148.6-33.1-34.6-58.8-75.1-76.3-120.3h-88c22.6 63.8 58.8 120.3 105.7 167.3-64.4 62.4-142.9 100.9-242 107.5l-22.3 84.8c122.9-13.6 222.9-63.5 301.1-140.7 54.2 56.5 120.6 98.6 193.2 122.6l42.6-83.3c-58.2-18.1-111.3-49.7-156.8-93.5 53.4-53.4 91.5-116.9 111-184.7h186.5v-88.1z" />
          </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">赞赏支持</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">感谢您对开发者的支持与鼓励</p>
        </div>
        {status === 'success' ? (
           <div className="text-center py-6 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">支付成功</p>
              <p className="text-sm text-slate-400 mt-1">感谢您的慷慨！</p>
           </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[1, 5, 10].map((amt) => (
                                <button key={amt} onClick={() => setAmount(amt)} className={`py-3 rounded-xl border font-bold transition-all ${amount === amt ? 'border-[#1677FF] bg-[#1677FF] bg-opacity-5 dark:bg-opacity-20 text-[#1677FF]' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'}`}>
                                    ¥{amt}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Extracted Category List Page ---
const CategoryListPage: React.FC<{ category: string, onBack: () => void }> = ({ category, onBack }) => {
    // Mock Data based on category
    const getCategoryData = () => {
        switch(category) {
            case 'food':
                return {
                    title: '周边美食',
                    items: [
                        { id: 'f1', title: '老北京炸酱面', desc: '地道风味，面条劲道', rating: 4.8, price: '¥35/人', dist: '500m', tag: '老字号', imgColor: 'from-orange-400 to-red-500' },
                        { id: 'f2', title: '四季民福烤鸭', desc: '皮酥肉嫩，果木炭火', rating: 4.9, price: '¥180/人', dist: '1.2km', tag: '必吃榜', imgColor: 'from-red-500 to-rose-600' },
                        { id: 'f3', title: '门框胡同卤煮', desc: '百年传承，汤浓味厚', rating: 4.5, price: '¥45/人', dist: '800m', tag: '特色小吃', imgColor: 'from-amber-500 to-orange-600' },
                        { id: 'f4', title: '东来顺饭庄', desc: '铜锅涮肉，选料精细', rating: 4.7, price: '¥120/人', dist: '2.5km', tag: '非遗美食', imgColor: 'from-teal-500 to-green-600' }
                    ]
                };
            case 'hotels':
                return {
                    title: '精选住宿',
                    items: [
                        { id: 'h1', title: '北京饭店', desc: '长安街上的历史地标', rating: 4.8, price: '¥1200起', dist: '300m', tag: '五星级', imgColor: 'from-blue-500 to-indigo-600' },
                        { id: 'h2', title: '王府井希尔顿', desc: '现代奢华，服务一流', rating: 4.7, price: '¥1500起', dist: '800m', tag: '豪华型', imgColor: 'from-indigo-500 to-purple-600' },
                        { id: 'h3', title: '全季酒店', desc: '简约舒适，性价比高', rating: 4.6, price: '¥500起', dist: '600m', tag: '舒适型', imgColor: 'from-teal-500 to-emerald-600' }
                    ]
                };
            case 'guides':
                return {
                    title: '热门攻略',
                    items: [
                        { id: 'g1', title: '故宫深度游全攻略', desc: '避开人流，这些机位拍照最美！', author: '旅行体验师_小王', avatar: 'bg-blue-500', likes: 2341, imgColor: 'from-red-400 to-pink-500' },
                        { id: 'g2', title: '北京胡同CityWalk路线', desc: '感受老北京的烟火气，吃喝玩乐一网打尽', author: '胡同串子', avatar: 'bg-green-500', likes: 1890, imgColor: 'from-teal-400 to-cyan-500' },
                        { id: 'g3', title: '第一次来北京怎么玩？', desc: '5天4晚保姆级行程安排，不走回头路', author: '爱旅游的猫', avatar: 'bg-purple-500', likes: 5621, imgColor: 'from-yellow-400 to-orange-500' }
                    ]
                };
            case 'attractions':
            default:
                return {
                    title: '热门景点',
                    items: [
                         { id: 'a1', title: '故宫博物院', desc: '世界五大宫之首', rating: 4.9, dist: '1.2km', tag: '5A景区', imgColor: 'from-red-600 to-orange-600' },
                         { id: 'a2', title: '天坛公园', desc: '明清皇帝祭天之所', rating: 4.8, dist: '3.5km', tag: '世界遗产', imgColor: 'from-blue-500 to-cyan-500' },
                         { id: 'a3', title: '北海公园', desc: '中国现存最古老皇家园林', rating: 4.7, dist: '2.0km', tag: '皇家园林', imgColor: 'from-emerald-500 to-teal-600' }
                    ]
                };
        }
    };

    const data = getCategoryData();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 animate-fadeIn scrollbar-hide">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 border-b border-slate-100 dark:border-slate-800 pt-12 pb-3 px-4">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <BackIcon />
                    </button>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white ml-2">{data.title}</h2>
                </div>
            </div>

            {/* Content List */}
            <div className="pt-36 px-4 space-y-4">
                {data.items.map((item: any) => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 active:scale-98 transition-transform flex gap-3">
                        <div className={`w-28 h-28 rounded-lg bg-gradient-to-br ${item.imgColor} flex-shrink-0 relative overflow-hidden group`}>
                             <div className="absolute inset-0 flex items-center justify-center text-white/30">
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                             </div>
                             {item.tag && <span className="absolute top-1 left-1 bg-black/30 backdrop-blur text-white text-[10px] px-1.5 py-0.5 rounded">{item.tag}</span>}
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 dark:text-white line-clamp-1">{item.title}</h3>
                                {item.author && (
                                    <div className="flex items-center mt-1 mb-1">
                                       <div className={`w-4 h-4 rounded-full ${item.avatar} mr-1.5`}></div>
                                       <span className="text-xs text-slate-500">{item.author}</span>
                                    </div>
                                )}
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.desc}</p>
                            </div>
                            
                            <div className="flex items-end justify-between mt-2">
                                <div className="flex flex-col">
                                    {item.rating && (
                                        <div className="flex items-center gap-0.5">
                                            {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i <= Math.round(item.rating)} />)}
                                            <span className="text-xs font-bold text-orange-500 ml-1">{item.rating}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    {item.price && <div className="text-sm font-bold text-red-500">{item.price}</div>}
                                    {item.dist && <div className="text-xs text-slate-400 mt-0.5">{item.dist}</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Extracted Search Results Page ---

interface SearchResultsPageProps {
  query: string;
  results: Landmark[];
  onBack: () => void;
  onSelect: (lm: Landmark) => void;
  loading: boolean;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ query, results, onBack, onSelect, loading }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 animate-fadeIn scrollbar-hide">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 border-b border-slate-100 dark:border-slate-800 pt-12 pb-3 px-4">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <BackIcon />
                    </button>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white ml-2">"{query}" 的搜索结果</h2>
                </div>
            </div>

            {/* List */}
            <div className="pt-28 px-4 space-y-4">
                {loading ? (
                    [1,2,3,4].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 h-24 animate-pulse"></div>
                    ))
                ) : results.length > 0 ? (
                    results.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => onSelect(item)}
                            className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 active:scale-98 transition-transform flex gap-3 cursor-pointer"
                        >
                            <div className={`w-20 h-20 rounded-lg bg-gradient-to-br from-blue-400 to-teal-500 flex-shrink-0 flex items-center justify-center text-white`}>
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z" /></svg>
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">{item.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                                <div className="flex items-center mt-2">
                                     <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded">{item.type || '景点'}</span>
                                     {item.distance && <span className="text-xs text-slate-400 ml-2">{item.distance}</span>}
                                </div>
                            </div>
                            <div className="flex items-center justify-center text-slate-300">
                                <ChevronRightIcon />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        未找到相关结果
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Extracted Landmark Detail Page ---

interface LandmarkDetailProps {
  landmark: Landmark;
  audioState: AudioState;
  user: User | null;
  onPlayGuide: (name: string, id: string, fullLandmark?: Landmark) => void;
  onUpdateLandmark: (updated: Landmark) => void;
  onStopAudio: () => void;
}

const LandmarkDetailPage: React.FC<LandmarkDetailProps> = ({ landmark, audioState, user, onPlayGuide, onUpdateLandmark, onStopAudio }) => {
    const isPlayingMain = audioState.isPlaying && audioState.playingItemName === landmark.name;
    const isPausedMain = audioState.isPaused && audioState.playingItemName === landmark.name;
    
    // Sub Attractions State
    const [loadingSpots, setLoadingSpots] = useState(false);
    
    // Fetch Sub Attractions if not present
    useEffect(() => {
        if ((!landmark.subAttractions || landmark.subAttractions.length === 0) && !loadingSpots) {
            setLoadingSpots(true);
            fetchSubAttractions(landmark.name).then(spots => {
                onUpdateLandmark({...landmark, subAttractions: spots});
            }).catch(e => {
                // Ignore API missing errors silently here, or handle
            }).finally(() => setLoadingSpots(false));
        }
    }, [landmark.id]); // Only re-run if ID changes
    
    // Review State
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviews, setReviews] = useState<Review[]>([
        { id: 'r1', user: 'Traveler_Mike', avatarColor: 'from-blue-400 to-blue-600', rating: 5, text: '景色非常壮观，历史感厚重，值得一去！', date: '2024-05-20' },
        { id: 'r2', user: 'Sarah.J', avatarColor: 'from-pink-400 to-rose-500', rating: 4, text: '人有点多，但是讲解非常详细。', date: '2024-05-18' }
    ]);

    const handleSubmitReview = () => {
        if (rating === 0) return;
        const newReview: Review = {
            id: Date.now().toString(),
            user: user ? user.name : '游客',
            avatarColor: user ? user.avatarColor : 'from-gray-400 to-gray-500',
            rating,
            text: reviewText,
            date: new Date().toLocaleDateString()
        };
        setReviews([newReview, ...reviews]);
        setReviewText('');
        setRating(0);
    };

    const subSpots = landmark.subAttractions || [];

    // Audio debug collection removed from in-page landmark detail

    const togglePlay = () => {
        // Main button logic now toggles Play/Pause or starts new
        console.log('landmark.name, landmark.id, landmark', landmark.name, landmark.id, landmark);
        onPlayGuide(landmark.name, landmark.id, landmark);
    };

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-0 animate-fadeIn relative scrollbar-hide">
         {/* Hero Image */}
         <div className="w-full h-64 bg-gradient-to-br from-teal-400 to-blue-500 relative flex items-end p-6">
            <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>
            <div className="relative z-10 text-white">
               <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-xs font-bold mb-2 inline-block">
                 {landmark.type || "景点"}
               </span>
               <h1 className="text-3xl font-bold">{landmark.name}</h1>
            </div>
         </div>

         <div className="flex-1 px-5 py-6 -mt-6 bg-slate-50 dark:bg-slate-950 rounded-t-3xl relative z-20 pb-32">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                   <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                   {landmark.distance || "距离未知"}
                </div>
                <div className="flex gap-2">
                   <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                   </button>
                   <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                   </button>
                </div>
             </div>

             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">景点简介</h3>
             <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-6">
               {landmark.description}
             </p>
             
             {/* Main Audio Player Status */}
             {(audioState.isPlaying || audioState.isPaused) && (
                 <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900/30 rounded-2xl border border-teal-100 dark:border-teal-800 animate-fadeIn flex items-start gap-3 shadow-sm">
                    <div className={`mt-1 w-2 h-2 rounded-full ${audioState.isPaused ? 'bg-orange-400' : 'bg-teal-500 animate-pulse'} shrink-0`}></div>
                    <div className="flex-1">
                       <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mb-1">
                          {audioState.isPaused ? '已暂停: ' : '正在讲解: '}{audioState.playingItemName}
                       </p>
                       <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-2">
                          {audioState.currentText || "正在生成精彩解说..."}
                       </p>
                    </div>
                    {audioState.isPlaying && (
                        <div className="ml-auto flex items-center h-full pt-1">
                            <div className="flex gap-0.5 h-3 items-end">
                                <div className="w-0.5 h-full bg-teal-500 animate-[bounce_1s_infinite]"></div>
                                <div className="w-0.5 h-2/3 bg-teal-500 animate-[bounce_1.2s_infinite]"></div>
                                <div className="w-0.5 h-full bg-teal-500 animate-[bounce_0.8s_infinite]"></div>
                            </div>
                        </div>
                    )}
                 </div>
             )}

                      <div className="flex gap-2 mb-10">
                      <button 
                          onPointerDown={() => { try { ensureAudioUnlockedNow(); unlockAudioOnUserGesture(); } catch (e){} }}
                          onTouchStart={() => { try { ensureAudioUnlockedNow(); unlockAudioOnUserGesture(); } catch (e){} }}
                          onClick={togglePlay}
                          disabled={audioState.isLoading}
                          className={`flex-1 py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      isPlayingMain
                        ? 'bg-amber-500 text-white shadow-amber-200 dark:shadow-amber-900/30' // Pause Style
                        : isPausedMain
                        ? 'bg-teal-600 text-white shadow-teal-200 dark:shadow-teal-900/30' // Resume Style
                        : 'bg-teal-600 text-white shadow-teal-200 dark:shadow-teal-900/30' // Start Style
                    }`}
                 >
                    {audioState.isLoading && audioState.playingItemName === landmark.name ? (
                       <span className="flex items-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 准备中...</span>
                    ) : isPlayingMain ? (
                       <><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> 暂停讲解</>
                    ) : isPausedMain ? (
                       <><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> 继续讲解</>
                    ) : (
                       <><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> 开始讲解</>
                    )}
                   </button>
             </div>

             {/* Sub Attractions Section */}
             <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white">精选景观</h3>
                   <span className="text-xs text-slate-400">左右滑动查看</span>
                </div>
                
                {loadingSpots ? (
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-44 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse flex-shrink-0"></div>
                        ))}
                    </div>
                ) : subSpots.length > 0 ? (
                    <div className="flex overflow-x-auto gap-3 pb-4 snap-x scrollbar-hide -mx-5 px-5">
                        {subSpots.map((spot, index) => {
                            const combinedName = `${landmark.name} ${spot.name}`;
                            const isSpotPlaying = audioState.isPlaying && audioState.playingItemName === combinedName;
                            const isSpotPaused = audioState.isPaused && audioState.playingItemName === combinedName;
                            // Gradients
                            const gradients = [
                                'from-orange-400 to-pink-500', 
                                'from-blue-400 to-indigo-500', 
                                'from-emerald-400 to-teal-500', 
                                'from-purple-400 to-fuchsia-500'
                            ];
                            const bgGradient = gradients[index % gradients.length];

                            return (
                                <button 
                                    key={spot.id}
                                    onClick={() => {
                                        onPlayGuide(combinedName, spot.id);
                                    }}
                                    className={`flex-shrink-0 w-40 rounded-xl text-left border snap-center transition-all overflow-hidden relative group bg-white dark:bg-slate-800 shadow-sm ${
                                        isSpotPlaying || isSpotPaused
                                            ? 'ring-2 ring-teal-500 shadow-teal-200 dark:shadow-teal-900/40' 
                                            : 'border-slate-100 dark:border-slate-700'
                                    }`}
                                >
                                    {/* Card Image Area */}
                                    <div className={`h-20 bg-gradient-to-br ${bgGradient} relative p-2`}>
                                        <div className="flex justify-between items-start">
                                            <span className="bg-black/20 backdrop-blur-md text-white text-[10px] px-1.5 py-0.5 rounded font-bold border border-white/10">
                                                {spot.type}
                                            </span>
                                            {isSpotPlaying && (
                                                <div className="flex gap-0.5 h-3 items-end">
                                                    <div className="w-0.5 h-full bg-white animate-[bounce_1s_infinite]"></div>
                                                    <div className="w-0.5 h-2/3 bg-white animate-[bounce_1.2s_infinite]"></div>
                                                    <div className="w-0.5 h-full bg-white animate-[bounce_0.8s_infinite]"></div>
                                                </div>
                                            )}
                                            {isSpotPaused && (
                                                <div className="text-white bg-black/30 rounded-full p-1 backdrop-blur-sm">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                                </div>
                                            )}
                                        </div>
                                        {/* Abstract Shape */}
                                        <div className="absolute -bottom-4 -right-4 text-white opacity-20">
                                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-3">
                                        <h4 className={`font-bold text-sm mb-1 truncate ${isSpotPlaying || isSpotPaused ? 'text-teal-600 dark:text-teal-400' : 'text-slate-800 dark:text-white'}`}>
                                            {spot.name}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 h-8 leading-4">
                                            {spot.description}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className={`text-[10px] font-medium ${isSpotPlaying || isSpotPaused ? 'text-teal-500' : 'text-slate-400'}`}>
                                                {isSpotPlaying ? '讲解中...' : isSpotPaused ? '已暂停' : '点击试听'}
                                            </span>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isSpotPlaying || isSpotPaused ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                                {isSpotPlaying ? (
                                                     <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                                ) : (
                                                     <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <p className="text-sm text-slate-400 italic">暂无具体景观信息</p>
                    </div>
                )}
             </div>

             {/* Reviews Section */}
             <div className="mb-20">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">游客评价</h3>
                
                {/* Review Input */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6">
                    <div className="flex gap-2 mb-3 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon key={star} filled={star <= rating} onClick={() => setRating(star)} />
                        ))}
                    </div>
                    <textarea 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
                        rows={3}
                        placeholder="分享您的游览体验..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    />
                    <button 
                        onClick={handleSubmitReview}
                        disabled={!rating || !reviewText.trim()}
                        className={`w-full py-2 rounded-lg text-sm font-bold text-white transition-colors ${!rating || !reviewText.trim() ? 'bg-slate-300 dark:bg-slate-600' : 'bg-teal-500 hover:bg-teal-600'}`}
                    >
                        提交评价
                    </button>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                    {reviews.map((rev) => (
                        <div key={rev.id} className="flex gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${rev.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                {rev.user.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{rev.user}</h4>
                                    <span className="text-xs text-slate-400">{rev.date}</span>
                                </div>
                                <div className="flex mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <StarIcon key={star} filled={star <= rev.rating} />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{rev.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
         </div>
      </div>
    );
};

// --- Extracted Views ---

interface HomeViewProps {
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
}

const HomeView: React.FC<HomeViewProps> = ({
  coords, landmarks, scanning, audioState, cameraImage, setCameraImage, 
  userQuery, setUserQuery, handleIdentify, handleOpenCamera, videoRef, 
  canvasRef, handleCapture, onLandmarkClick, onCategoryClick,
  onSearch, onRefreshLocation, locationName, hasKeys, onSetupKeys
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Audio debug UI removed from HomeView

    const handleSubmit = () => {
        if (!searchQuery.trim()) return;
        onSearch(searchQuery);
        setSearchQuery('');
    };

    return (
    <div className="pb-40 animate-fadeIn scrollbar-hide">
      {/* Sticky Top Bar (Immersive style but sticky) */}
      <div className="sticky top-0 z-50 bg-blue-600/95 backdrop-blur-md pt-14 pb-4 px-6 shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
              <div onClick={onRefreshLocation} className="flex flex-col cursor-pointer active:opacity-80">
                 <div className="flex items-center text-blue-100 text-sm mb-1 font-medium">
                    <LocationArrow /> 
                    <span className="mr-1">{locationName}</span>
                    <GpsFixedIcon className="w-3 h-3 text-white opacity-70" />
                 </div>
                 <h1 className="text-xl font-bold text-white tracking-wide">探索周边</h1>
              </div>
              <div className="flex flex-col items-end">
                 <div className="flex items-center text-white font-bold text-xl">
                    <CloudIcon /> <span className="ml-2">24°</span>
                 </div>
                 <span className="text-blue-100 text-xs">多云 · 空气优</span>
              </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/20 backdrop-blur-md p-1 rounded-full flex items-center border border-white/30 text-white placeholder-blue-100 focus-within:bg-white/30 transition-colors relative">
              <div className="p-2 ml-1"><SearchIcon /></div>
              <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="搜索景点 (如: 西湖)" 
                  className="bg-transparent border-none outline-none w-full text-sm placeholder-blue-100 text-white h-8" 
              />
            </div>

            {/* Audio debug UI removed from HomeView */}
            
            <button 
               onClick={handleSubmit}
               className="h-10 px-4 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white hover:bg-white/30 active:scale-95 transition-all shadow-sm font-bold text-sm"
            >
                搜索
            </button>
          </div>
      </div>

      {/* Decorative Scrolling Header Background to connect seamlessly with sticky header */}
      <div className="relative bg-slate-50 dark:bg-slate-900">
        <div className="h-16 bg-gradient-to-b from-blue-600 to-teal-500 rounded-b-[40px] shadow-sm relative -mt-[1px]"></div>
        
        {/* Quick Access Categories (Negative Margin to pull up) */}
        <div className="px-6 -mt-10 relative z-20 flex justify-between">
           {[
               { name: '景点', id: 'attractions', color: 'bg-orange-100 text-orange-600', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
               { name: '美食', id: 'food', color: 'bg-red-100 text-red-600', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000 4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
               { name: '酒店', id: 'hotels', color: 'bg-blue-100 text-blue-600', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
               { name: '攻略', id: 'guides', color: 'bg-purple-100 text-purple-600', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
           ].map((cat, i) => (
               <button key={i} onClick={() => onCategoryClick(cat.id)} className="flex flex-col items-center active:scale-95 transition-transform">
                   <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center shadow-lg shadow-black/5 dark:shadow-none border-2 border-white dark:border-slate-800`}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={cat.icon} /></svg>
                   </div>
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-2">{cat.name}</span>
               </button>
           ))}
        </div>

        <div className="px-6 mt-8">
          
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-teal-500/10 dark:shadow-none border border-teal-50 dark:border-slate-700 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-10">
                 <svg className="w-32 h-32 text-teal-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
             </div>
             
             <div className="relative z-10">
                 <div className="flex items-center justify-between mb-4">
                     <div>
                         <h2 className="text-lg font-bold text-slate-800 dark:text-white">AI 智能导游</h2>
                         <p className="text-xs text-slate-400">拍照或输入，实时识别讲解</p>
                     </div>
                     <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-[10px] font-bold rounded">实时在线</span>
                 </div>
                 
                 <div className="flex flex-col items-center justify-center mb-6">
                     <Radar scanning={scanning || audioState.isPlaying} />
                     <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                        {scanning ? "正在识别分析..." : audioState.isPlaying ? "正在讲解中" : audioState.isPaused ? "讲解已暂停" : "点击下方开始探索"}
                     </p>
                 </div>
                 
                 {/* Multimodal Inputs */}
                 <div className="space-y-3">
                     {/* Camera Input Area */}
                     {cameraImage ? (
                         <div className="relative w-full h-32 bg-black rounded-xl overflow-hidden">
                             <img src={cameraImage} className="w-full h-full object-cover" alt="capture" />
                             <Button onClick={() => setCameraImage(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></Button>
                         </div>
                     ) : (
                         <div className="flex gap-2">
                             <Button onClick={handleOpenCamera} className="flex-1 py-3 bg-slate-50 dark:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                                 <CameraIcon /> <span className="text-sm">拍摄景物</span>
                             </Button>
                             {/* Hidden video element for capture */}
                             <div className={`fixed inset-0 bg-black z-[60] flex flex-col ${videoRef.current?.srcObject ? 'block' : 'hidden'}`}>
                                 <video ref={videoRef as unknown as React.LegacyRef<HTMLVideoElement>} className="w-full h-full object-cover" autoPlay playsInline muted></video>
                                 <div className="absolute bottom-10 left-0 w-full flex justify-center gap-8">
                                     <Button onClick={() => { 
                                         const s = videoRef.current?.srcObject as MediaStream; 
                                         s?.getTracks().forEach(t => t.stop()); 
                                         if(videoRef.current) videoRef.current.srcObject = null;
                                     }} className="w-16 h-16 rounded-full bg-slate-800/50 text-white flex items-center justify-center border border-white">取消</Button>
                                     <Button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white border-4 border-slate-300 flex items-center justify-center shadow-lg"></Button>
                                 </div>
                             </div>
                             <canvas ref={canvasRef as unknown as React.LegacyRef<HTMLCanvasElement>} className="hidden" />
                         </div>
                     )}
                     
                     {/* Text Input */}
                     <div className="relative">
                         <input 
                             value={userQuery}
                             onChange={e => setUserQuery(e.target.value)}
                             onKeyDown={e => e.key === 'Enter' && handleIdentify()}
                             className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-sm focus:ring-2 ring-teal-500 outline-none dark:text-white" 
                             placeholder="输入问题 (例如: 这个塔多高?)"
                         />
                         <button className="absolute right-2 top-2 p-1.5 bg-teal-500 rounded-lg text-white" onPointerDown={() => { try { ensureAudioUnlockedNow(); } catch (e){} }} onTouchStart={() => { try { ensureAudioUnlockedNow(); } catch (e){} }} onClick={handleIdentify}>
                             <SendIcon />
                         </button>
                     </div>
                     
                                        <button 
                                            onPointerDown={() => { try { ensureAudioUnlockedNow(); unlockAudioOnUserGesture(); } catch (e){} }}
                                            onTouchStart={() => { try { ensureAudioUnlockedNow(); unlockAudioOnUserGesture(); } catch (e){} }}
                                            onClick={handleIdentify}
                                            disabled={scanning}
                                            className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-teal-200 dark:shadow-none active:scale-95 transition-transform"
                                        >
                                            {scanning ? "分析中..." : "开始识别并讲解"}
                                        </button>
                 </div>
             </div>
          </div>

          {/* Nearby Landmarks List */}
          <h3 className="mt-8 mb-4 font-bold text-lg text-slate-800 dark:text-white flex items-center">
              <span className="w-1 h-5 bg-teal-500 rounded-full mr-2"></span>
              周边推荐
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {landmarks.length > 0 ? landmarks.map((lm, index) => (
              <div 
                key={lm.id} 
                onClick={() => onLandmarkClick(lm)}
                className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform"
              >
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl mb-3 relative overflow-hidden group">
                    {/* Visual Placeholder: Gradient + Icon */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${['from-blue-400 to-indigo-500', 'from-teal-400 to-emerald-500', 'from-orange-400 to-red-500', 'from-purple-400 to-pink-500'][index % 4]}`}></div>
                    
                    {/* Overlay Type Tag */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/20 backdrop-blur-md rounded-lg border border-white/20">
                        <span className="text-white text-[10px] font-bold tracking-wide">{lm.type || "景点"}</span>
                    </div>
                    
                    {/* Decorative Icon inside placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 text-white">
                        <svg className="w-12 h-12 transform group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    </div>
                </div>
                
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1 flex-1 mr-2">{lm.name}</h4>
                    <div className="flex items-center bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded text-[10px] font-bold text-orange-500">
                        <svg className="w-2.5 h-2.5 mr-0.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        4.9
                    </div>
                </div>
                
                <div className="flex items-center text-xs text-slate-400">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {lm.distance || '1.2km'}
                </div>
              </div>
            )) : (
              [1, 2].map(i => (
                 <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )};

interface ProfileViewProps {
  user: User | null;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setSubPage: (page: SubPage) => void;
  setShowDonation: (val: boolean) => void;
  handleLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  user, isDarkMode, toggleTheme, setSubPage, setShowDonation, handleLogout
}) => (
    <div className="pb-40 animate-fadeIn scrollbar-hide">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md pt-14 pb-4 px-6 flex items-center justify-between transition-colors">
         <h1 className="text-2xl font-bold text-slate-800 dark:text-white">个人中心</h1>
         <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
             {isDarkMode ? <SunIcon /> : <MoonIcon />}
         </button>
      </div>

      <div className="px-6 mt-4">
        {/* User Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
            {user ? (
                <div className="flex items-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${user.avatarColor} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                        {user.name.charAt(0)}
                    </div>
                    <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user.name}</h2>
                                                <button onClick={() => setSubPage('edit_profile')} className="text-slate-400 hover:text-teal-500"><EditIcon /></button>
                        </div>
                        <div className="flex items-center mt-1">
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full mr-2">{user.level}</span>
                            {user.isVip && <span className="px-2 py-0.5 bg-black text-gold text-[#FFD700] text-[10px] font-bold rounded-full">VIP</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-1">{user.bio || '暂无个性签名'}</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-4 cursor-pointer" onClick={() => setSubPage('login')}>
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 mb-3">
                        <UserIcon active={false} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">点击登录 / 注册</h2>
                    <p className="text-sm text-slate-400 mt-1">登录后同步您的旅行足迹</p>
                </div>
            )}
        </div>

        <div className="space-y-3">
          <button onClick={() => setSubPage('history')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm active:scale-98 transition-transform">
             <div className="flex items-center">
                 <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg mr-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <span className="font-bold text-slate-700 dark:text-slate-200">历史讲解记录</span>
             </div>
             <ChevronRightIcon />
          </button>
          
          <button onClick={() => setSubPage('voice_settings')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm active:scale-98 transition-transform">
             <div className="flex items-center">
                 <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-lg mr-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                 </div>
                 <span className="font-bold text-slate-700 dark:text-slate-200">讲解语音偏好</span>
             </div>
             <ChevronRightIcon />
          </button>
          
          <button onClick={() => setSubPage('api_key_settings')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm active:scale-98 transition-transform">
             <div className="flex items-center">
                 <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-lg mr-3">
                    <KeyIcon />
                 </div>
                 <span className="font-bold text-slate-700 dark:text-slate-200">服务配置 (API Keys)</span>
             </div>
             <ChevronRightIcon />
          </button>

          <button onClick={() => setShowDonation(true)} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm active:scale-98 transition-transform">
             <div className="flex items-center">
                 <div className="p-2 bg-pink-50 dark:bg-pink-900/20 text-pink-500 rounded-lg mr-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                 </div>
                 <span className="font-bold text-slate-700 dark:text-slate-200">赞赏开发者</span>
             </div>
             <ChevronRightIcon />
          </button>
        </div>

        {user && (
            <button onClick={handleLogout} className="w-full mt-8 py-3 rounded-xl border border-red-100 text-red-500 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 font-bold text-sm">
                退出登录
            </button>
        )}

        <div className="mt-12 text-center">
            <p className="text-xs text-slate-300 dark:text-slate-600">TravelPal AI v1.3.0</p>
        </div>
      </div>
    </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const [subPage, setSubPage] = useState<SubPage>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [locationName, setLocationName] = useState<string>("定位中...");
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [scanning, setScanning] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>({ isPlaying: false, isPaused: false, isLoading: false, currentText: null, playingItemName: null });
  const [showDonation, setShowDonation] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('Fenrir');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLandmark, setCurrentLandmark] = useState<Landmark | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('attractions');
    // Navigation history stack (each entry stores a snapshot of view state)
    const [navStack, setNavStack] = useState<Array<any>>([]);

    const pushView = () => {
        setNavStack(prev => [...prev, { activeTab, subPage, currentLandmark, activeCategory }]);
    };

    const popView = () => {
        setNavStack(prev => {
            if (!prev || prev.length === 0) {
                // nothing to pop: go home
                setActiveTab('home');
                setSubPage(null);
                return [];
            }
            const last = prev[prev.length - 1];
            const rest = prev.slice(0, -1);
            try {
                setActiveTab(last.activeTab || 'home');
                setCurrentLandmark(last.currentLandmark || null);
                setActiveCategory(last.activeCategory || 'attractions');
                setSubPage(last.subPage || null);
            } catch (e) {}
            return rest;
        });
    };

    const navigateTo = (targetSubPage: SubPage, opts?: { activeTab?: 'home'|'profile', currentLandmark?: Landmark | null, activeCategory?: string }) => {
        // push current view onto stack then navigate
        pushView();
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
            const gemKey = localStorage.getItem('GEMINI_API_KEY');
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
                setToastMessage('未配置 Gemini API Key，打开「服务配置」设置以继续');
                addAmapLog('gemini-key-missing', ev?.detail);
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
    

  // Check keys on load
  useEffect(() => {
        // Read env values (if present)
        const env = (import.meta as any).env || {};
        const envAmapKey = env?.VITE_AMAP_KEY;
        const envAmapSecret = env?.VITE_AMAP_SECRET;
        const envDeepseek = env?.VITE_DEEPSEEK_KEY;
        const envGemini = env?.VITE_API_KEY;

        // DEV convenience: if running in dev mode and env keys exist, copy them into localStorage
        // This is ONLY for local development convenience and won't run in production builds.
        if (env?.DEV) {
            try {
                if (envAmapKey && !localStorage.getItem('AMAP_KEY')) {
                    localStorage.setItem('AMAP_KEY', envAmapKey);
                    addAmapLog('dev-write', { key: 'AMAP_KEY' });
                }
                if (envAmapSecret && !localStorage.getItem('AMAP_SECRET')) {
                    localStorage.setItem('AMAP_SECRET', envAmapSecret);
                    addAmapLog('dev-write', { key: 'AMAP_SECRET' });
                }
                if (envDeepseek && !localStorage.getItem('DEEPSEEK_KEY')) {
                    localStorage.setItem('DEEPSEEK_KEY', envDeepseek);
                    addAmapLog('dev-write', { key: 'DEEPSEEK_KEY' });
                }
                if (envGemini && !localStorage.getItem('GEMINI_API_KEY')) {
                    localStorage.setItem('GEMINI_API_KEY', envGemini);
                    addAmapLog('dev-write', { key: 'GEMINI_API_KEY' });
                }
            } catch (e) {
                console.warn('Failed to write dev env keys to localStorage', e);
            }
        }

        const k1 = localStorage.getItem("AMAP_KEY");
        const k2 = localStorage.getItem("AMAP_SECRET");
        const k3 = localStorage.getItem("DEEPSEEK_KEY");
        // Priority: LocalStorage -> Vite env var (Auto-config)
        const k4 = localStorage.getItem("GEMINI_API_KEY") || envGemini;

        if ((k1 && k2 && k3) || k4) {
            setHasKeys(true);
        } else {
            setHasKeys(false); // Still false, but we allow fallback
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
      if (subPage === 'landmark_detail' && currentLandmark) {
          return (
            <div className="relative scrollbar-hide">
                        <div className="fixed top-6 left-4 z-[260] pointer-events-auto">
                             <button type="button" onClick={() => { stopAudio(); popView(); }} className="p-2 rounded-full bg-black/30 backdrop-blur text-white shadow-lg">
                                 <BackIcon />
                             </button>
                            </div>
              <LandmarkDetailPage 
                landmark={currentLandmark} 
                audioState={audioState} 
                user={user}
                onPlayGuide={playAudio} 
                onUpdateLandmark={(updated) => {
                    setCurrentLandmark(updated);
                    setLandmarks(prev => prev.map(l => l.id === updated.id ? updated : l));
                }}
                onStopAudio={stopAudio}
              />
            </div>
          );
      }
    
      // Search Results Page
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

      // Category List Page
        if (subPage === 'category_list') {
            return <CategoryListPage category={activeCategory} onBack={() => { stopAudio(); popView(); }} />;
      }
    
      // Auth Pages
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
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      handleUpdateProfile(form.username.value, form.bio.value);
                  }} className="space-y-6">
                       <div className="flex justify-center mb-6">
                           <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${user?.avatarColor || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-slate-800 shadow-xl`}>
                             {user?.name.charAt(0)}
                           </div>
                       </div>
                       <div>
                           <label className="block text-sm text-slate-500 mb-2">昵称</label>
                           <input name="username" defaultValue={user?.name} className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" />
                       </div>
                       <div>
                           <label className="block text-sm text-slate-500 mb-2">个性签名</label>
                           <textarea name="bio" defaultValue={user?.bio} className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" rows={3} />
                       </div>
                       <button type="submit" className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg">保存修改</button>
                  </form>
              </div>
          );
      }
    
      // API Key Settings Page
      if (subPage === 'api_key_settings') {
         return (
             <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 pb-6 pt-16 animate-fadeIn scrollbar-hide">
                 <div className="flex items-center mb-8">
                     <button onClick={() => { stopAudio(); popView(); }} className="mr-4 text-slate-500"><BackIcon /></button>
                     <h2 className="text-xl font-bold text-slate-800 dark:text-white">API Key 设置</h2>
                 </div>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                     <p className="text-sm text-slate-500 dark:text-slate-400 border-b pb-4 dark:border-slate-700">
                         请至少配置一组服务 Key。高德+DeepSeek 适合国内使用，Gemini 适合国际网络环境。
                     </p>
                     
                     {/* Domestic Section */}
                     <div className="space-y-4">
                         <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center">
                             <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                             国内服务 (推荐)
                         </h3>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">高德地图 Key (Web端/JSAPI)</label>
                            <input 
                                type="text" 
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white text-sm"
                                defaultValue={localStorage.getItem("AMAP_KEY") || ""}
                                onChange={(e) => localStorage.setItem("AMAP_KEY", e.target.value)}
                            />
                         </div>
    
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">高德安全密钥 (Security Code)</label>
                            <input 
                                type="password" 
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white text-sm"
                                defaultValue={localStorage.getItem("AMAP_SECRET") || ""}
                                onChange={(e) => localStorage.setItem("AMAP_SECRET", e.target.value)}
                            />
                         </div>
    
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">DeepSeek API Key</label>
                            <input 
                                type="password" 
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white text-sm"
                                defaultValue={localStorage.getItem("DEEPSEEK_KEY") || ""}
                                onChange={(e) => localStorage.setItem("DEEPSEEK_KEY", e.target.value)}
                            />
                         </div>
                     </div>
    
                     {/* International Section */}
                     <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                         <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center">
                             <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                             国际服务 (Gemini Fallback)
                         </h3>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Gemini API Key</label>
                            <input 
                                type="password" 
                                placeholder={(import.meta as any).env?.VITE_API_KEY ? "已自动配置 (默认)" : "输入 API Key"}
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white text-sm"
                                defaultValue={localStorage.getItem("GEMINI_API_KEY") || ""}
                                onChange={(e) => localStorage.setItem("GEMINI_API_KEY", e.target.value)}
                            />
                         </div>
                     </div>
    
                         <div className="flex justify-end pt-2">
                         <button onClick={() => { stopAudio(); popView(); }} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-bold shadow-lg w-full">
                             保存配置并返回
                         </button>
                     </div>
                 </div>
             </div>
         );
      }
    
      // Other Subpages
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
                         <button 
                            key={v.id} 
                            onClick={() => {
                                setSelectedVoice(v.id);
                                localStorage.setItem('voice_pref', v.id);
                            }}
                            className={`w-full p-4 rounded-xl flex items-center justify-between border transition-all ${selectedVoice === v.id ? 'bg-teal-50 border-teal-500 shadow-sm dark:bg-teal-900/20' : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700'}`}
                         >
                             <div className="text-left">
                                 <div className={`font-bold ${selectedVoice === v.id ? 'text-teal-700 dark:text-teal-400' : 'text-slate-800 dark:text-white'}`}>{v.name}</div>
                                 <div className="text-xs text-slate-500 mt-1">{v.desc}</div>
                             </div>
                             {selectedVoice === v.id && (
                                 <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center">
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                 </div>
                             )}
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
             return <HomeView 
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
                onLandmarkClick={(lm) => { navigateTo('landmark_detail', { currentLandmark: lm }); }}
                onCategoryClick={(cat) => { navigateTo('category_list', { activeCategory: cat }); }}
                onSearch={handleSearch}
                onRefreshLocation={refreshLocation}
                locationName={locationName}
                hasKeys={hasKeys}
                onSetupKeys={() => { navigateTo('api_key_settings', { activeTab: 'profile' }); }}
             />;
      } else {
             return <ProfileView 
                user={user}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                setSubPage={setSubPage}
                setShowDonation={setShowDonation}
                handleLogout={handleLogout}
             />;
      }
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

export default App;