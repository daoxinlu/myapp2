import React, { useEffect, useState } from 'react';
import { Landmark, AudioState, Review, User } from '../types';
import { fetchSubAttractions } from '../services/geminiService';
import { unlockAudioOnUserGesture, ensureAudioUnlockedNow, primeSpeechSynthesisNow, playSilentAudioNow } from '../utils/audioUtils';
// Use native button to allow pointer/touch handlers without typing conflicts

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
    const [loadingSpots, setLoadingSpots] = useState(false);

    useEffect(() => {
        if ((!landmark.subAttractions || landmark.subAttractions.length === 0) && !loadingSpots) {
            setLoadingSpots(true);
            fetchSubAttractions(landmark.name).then(spots => {
                onUpdateLandmark({...landmark, subAttractions: spots});
            }).catch(e => {
                // ignore
            }).finally(() => setLoadingSpots(false));
        }
    }, [landmark.id]);

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

    const togglePlay = () => {
        // Try immediate unlock and fallback to the generic unlock helper
        try { ensureAudioUnlockedNow(); } catch (e) {}
        try { unlockAudioOnUserGesture(); } catch (e) {}
        try { primeSpeechSynthesisNow(); } catch (e) {}
        try { playSilentAudioNow(); } catch (e) {}
        try {
            // Provide an immediate audible feedback inside the user gesture so
            // browsers grant permission for later TTS playback. Keep it short.
            const synth = window.speechSynthesis;
            if (synth) {
                const u = new SpeechSynthesisUtterance('正在准备讲解');
                u.lang = 'zh-CN';
                // low volume where supported
                try { u.volume = 0.2; } catch (e) {}
                synth.speak(u);
            }
        } catch (e) {
            // ignore
        }
        onPlayGuide(landmark.name, landmark.id, landmark);
    };

        // Audio debug UI removed

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-0 animate-fadeIn relative scrollbar-hide">
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
             <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-6">{landmark.description}</p>

             <div className="mb-6">
                 <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">快速操作</div>
                      <div className="flex gap-2 mb-4">
                          <button type="button" onClick={togglePlay} onPointerDown={() => { try { ensureAudioUnlockedNow(); primeSpeechSynthesisNow(); playSilentAudioNow(); } catch (e){} }} onTouchStart={() => { try { ensureAudioUnlockedNow(); primeSpeechSynthesisNow(); playSilentAudioNow(); } catch (e){} }} className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-bold shadow-lg">
                              {isPlayingMain ? '暂停讲解' : isPausedMain ? '继续讲解' : '开始讲解'}
                          </button>
                      </div>
             </div>

            {/* Audio debug UI removed */}

             <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white">精选景观</h3>
                   <span className="text-xs text-slate-400">左右滑动查看</span>
                </div>
                {loadingSpots ? (
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5">{[1,2,3].map(i => <div key={i} className="w-44 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse flex-shrink-0"></div>)}</div>
                ) : subSpots.length > 0 ? (
                    <div className="flex overflow-x-auto gap-3 pb-4 snap-x scrollbar-hide -mx-5 px-5">
                        {subSpots.map((spot, index) => {
                            const combinedName = `${landmark.name} ${spot.name}`;
                            const isSpotPlaying = audioState.isPlaying && audioState.playingItemName === combinedName;
                            const isSpotPaused = audioState.isPaused && audioState.playingItemName === combinedName;
                            const gradients = ['from-orange-400 to-pink-500','from-blue-400 to-indigo-500','from-emerald-400 to-teal-500','from-purple-400 to-fuchsia-500'];
                            const bgGradient = gradients[index % gradients.length];
                            return (
                                <button key={spot.id} onClick={() => { unlockAudioOnUserGesture(); onPlayGuide(combinedName, spot.id); }} className={`flex-shrink-0 w-40 rounded-xl text-left border snap-center transition-all overflow-hidden relative group bg-white dark:bg-slate-800 shadow-sm ${isSpotPlaying || isSpotPaused ? 'ring-2 ring-teal-500 shadow-teal-200 dark:shadow-teal-900/40' : 'border-slate-100 dark:border-slate-700'}`}>
                                    <div className={`h-20 bg-gradient-to-br ${bgGradient} relative p-2`}>
                                        <div className="flex justify-between items-start">
                                            <span className="bg-black/20 backdrop-blur-md text-white text-[10px] px-1.5 py-0.5 rounded font-bold border border-white/10">{spot.type}</span>
                                            {isSpotPlaying && (<div className="flex gap-0.5 h-3 items-end"><div className="w-0.5 h-full bg-white animate-[bounce_1s_infinite]"></div><div className="w-0.5 h-2/3 bg-white animate-[bounce_1.2s_infinite]"></div></div>)}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1">{spot.name}</h4>
                                        <p className="text-xs text-slate-400 mt-1">{spot.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-slate-400">暂无景观</div>
                )}
             </div>

         </div>
      </div>
    );
};

export default LandmarkDetailPage;
