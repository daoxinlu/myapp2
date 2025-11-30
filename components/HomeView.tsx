import React, { useState } from 'react';
import { Button } from 'antd-mobile';
import { Coordinates, Landmark, AudioState } from '../types';
import Radar from './Radar';
import { LocationArrow, GpsFixedIcon, CloudIcon, SearchIcon, CameraIcon, SendIcon } from './icons';

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

    const handleSubmit = () => {
        if (!searchQuery.trim()) return;
        onSearch(searchQuery);
        setSearchQuery('');
    };

    return (
    <div className="pb-40 animate-fadeIn scrollbar-hide">
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

            <button 
               onClick={handleSubmit}
               className="h-10 px-4 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white hover:bg-white/30 active:scale-95 transition-all shadow-sm font-bold text-sm"
            >
                搜索
            </button>
          </div>
      </div>

      <div className="relative bg-slate-50 dark:bg-slate-900">
        <div className="h-16 bg-gradient-to-b from-blue-600 to-teal-500 rounded-b-[40px] shadow-sm relative -mt-[1px]"></div>
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
                <p className="text-sm font-medium text-teal-600 dark:text-teal-400">{scanning ? '正在识别分析...' : audioState.isPlaying ? '正在讲解中' : audioState.isPaused ? '讲解已暂停' : '点击下方开始探索'}</p>
              </div>

              <div className="space-y-3">
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

                    <div className={`fixed inset-0 bg-black z-[60] flex flex-col ${videoRef.current?.srcObject ? 'block' : 'hidden'}`}>
                      <video ref={videoRef as unknown as React.LegacyRef<HTMLVideoElement>} className="w-full h-full object-cover" autoPlay playsInline muted></video>
                      <div className="absolute bottom-10 left-0 w-full flex justify-center gap-8">
                        <Button onClick={() => { const s = videoRef.current?.srcObject as MediaStream; s?.getTracks().forEach(t => t.stop()); if(videoRef.current) videoRef.current.srcObject = null; }} className="w-16 h-16 rounded-full bg-slate-800/50 text-white flex items-center justify-center border border-white">取消</Button>
                        <Button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white border-4 border-slate-300 flex items-center justify-center shadow-lg"></Button>
                      </div>
                    </div>
                    <canvas ref={canvasRef as unknown as React.LegacyRef<HTMLCanvasElement>} className="hidden" />
                  </div>
                )}

                <div className="relative">
                  <input 
                    value={userQuery}
                    onChange={e => setUserQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleIdentify()}
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-sm focus:ring-2 ring-teal-500 outline-none dark:text-white" 
                    placeholder="输入问题 (例如: 这个塔多高?)"
                  />
                  <button className="absolute right-2 top-2 p-1.5 bg-teal-500 rounded-lg text-white" onPointerDown={() => { try { /* ensureAudioUnlockedNow() */ } catch (e){} }} onTouchStart={() => { try { /* ensureAudioUnlockedNow() */ } catch (e){} }} onClick={handleIdentify}>
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
                  </button>
                </div>

                <button 
                  onPointerDown={() => { try { /* ensureAudioUnlockedNow(); */ } catch (e){} }}
                  onTouchStart={() => { try { /* ensureAudioUnlockedNow(); */ } catch (e){} }}
                  onClick={handleIdentify}
                  disabled={scanning}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-teal-200 dark:shadow-none active:scale-95 transition-transform"
                >
                  {scanning ? '分析中...' : '开始识别并讲解'}
                </button>
              </div>
            </div>
          </div>

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
                  <div className={`absolute inset-0 bg-gradient-to-br ${['from-blue-400 to-indigo-500', 'from-teal-400 to-emerald-500', 'from-orange-400 to-red-500', 'from-purple-400 to-pink-500'][index % 4]}`}></div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/20 backdrop-blur-md rounded-lg border border-white/20"><span className="text-white text-[10px] font-bold tracking-wide">{lm.type || '景点'}</span></div>
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

                <div className="flex items-center text-xs text-slate-400"><svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>{lm.distance || '1.2km'}</div>
              </div>
            )) : ([1,2].map(i => (<div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
