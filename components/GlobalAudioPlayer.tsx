import React from 'react';
import { AudioState } from '../types';
import { ensureAudioUnlockedNow, unlockAudioOnUserGesture } from '../utils/audioUtils';

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

export default GlobalAudioPlayer;

