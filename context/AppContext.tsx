import React, { createContext, useContext } from 'react';
import { Coordinates, Landmark, AudioState, User } from '../types';

export type SubPageLocal = 'landmark_detail' | 'search_results' | 'category_list' | 'login' | 'register' | 'edit_profile' | 'api_key_settings' | 'voice_settings' | 'history' | null;

export interface AppContextType {
    // UI / navigation
    activeTab: 'home' | 'profile';
    setActiveTab: (t: 'home'|'profile') => void;
    subPage: SubPageLocal;
    setSubPage: (s: SubPageLocal) => void;
    currentLandmark: Landmark | null;
    setCurrentLandmark: (l: Landmark | null) => void;
    activeCategory: string;
    setActiveCategory: (c: string) => void;

    // Location
    coords: Coordinates | null;
    setCoords: (c: Coordinates | null) => void;
    locationName: string;
    setLocationName: (n: string) => void;

    // Audio
    audioState: AudioState;
    setAudioState: (s: AudioState) => void;
    selectedVoice: string;
    setSelectedVoice: (v: string) => void;

    // Theme
    isDarkMode: boolean;
    toggleTheme: () => void;

    // Data
    landmarks: Landmark[];
    setLandmarks: (l: Landmark[]) => void;
    history: any[];
    setHistory: (h: any[]) => void;
    user: User | null;
    setUser: (u: User | null) => void;

    // Misc
    hasKeys: boolean;
    setHasKeys: (b: boolean) => void;
    toastMessage: string | null;
    setToastMessage: (m: string | null) => void;
}

const defaultCtx: AppContextType = {
    activeTab: 'home',
    setActiveTab: () => {},
    subPage: null,
    setSubPage: () => {},
    currentLandmark: null,
    setCurrentLandmark: () => {},
    activeCategory: 'attractions',
    setActiveCategory: () => {},
    coords: null,
    setCoords: () => {},
    locationName: '定位当前位置',
    setLocationName: () => {},
    audioState: { isPlaying: false, isPaused: false, isLoading: false, currentText: null, playingItemName: null },
    setAudioState: () => {},
    selectedVoice: 'Fenrir',
    setSelectedVoice: () => {},
    isDarkMode: false,
    toggleTheme: () => {},
    landmarks: [],
    setLandmarks: () => {},
    history: [],
    setHistory: () => {},
    user: null,
    setUser: () => {},
    hasKeys: false,
    setHasKeys: () => {},
    toastMessage: null,
    setToastMessage: () => {},
};

const AppContext = createContext<AppContextType>(defaultCtx);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // This is a lightweight scaffold provider. We'll incrementally move real state
    // from `App.tsx` into this provider in subsequent steps.
    return (
        <AppContext.Provider value={defaultCtx}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);

export default AppContext;
