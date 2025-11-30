import React from 'react';

export const BackIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'h-6 w-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
);

export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? 'w-4 h-4 text-slate-300 dark:text-slate-600'} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
);

export const StarIcon: React.FC<{ filled?: boolean; onClick?: () => void }> = ({ filled = false, onClick }) => (
  <svg 
    onClick={onClick} 
    className={`w-3.5 h-3.5 ${filled ? 'text-orange-400' : 'text-slate-300 dark:text-slate-600'} ${onClick ? 'cursor-pointer transform hover:scale-110 transition-transform' : ''}`} 
    fill="currentColor" 
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export const LocationArrow: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? 'w-4 h-4 mr-1'} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19l-7-7 7-7v14zm6-14l7 7-7 7V5z" /></svg>
);

export const GpsFixedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? 'w-3 h-3'} fill="currentColor" viewBox="0 0 24 24"><path d="M12 8a4 4 0 100 8 4 4 0 000-8z" opacity=".9"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" opacity=".6"/></svg>
);

export const CloudIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? 'w-5 h-5'} fill="currentColor" viewBox="0 0 24 24"><path d="M19 18.5A4.5 4.5 0 0014.5 14H9a4 4 0 010-8 5 5 0 015 5h.5A4.5 4.5 0 0119 11.5c1.93 0 3.5 1.57 3.5 3.5S20.93 18.5 19 18.5z"/></svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? 'w-5 h-5 text-white'} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
);

export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? 'w-5 h-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h4l2-3h6l2 3h4v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? 'w-5 h-5 text-white'} viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
);

export const MapIcon: React.FC<{ active?: boolean }> = ({ active }) => (
  <svg className={`w-6 h-6 ${active ? 'text-teal-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.894L9 1l6 2 5.447 2.724A2 2 0 0121 8.618v9.764a2 2 0 01-1.553 1.894L15 23l-6-2z"/></svg>
);

export const UserIcon: React.FC<{ active?: boolean }> = ({ active }) => (
  <svg className={`w-6 h-6 ${active ? 'text-teal-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.39 0 4.637.525 6.879 1.515M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
);

export const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? 'w-5 h-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 21v-2a4 4 0 10-4-4h-1l-3 3v-1H3v4h4v-1l3-3h1a4 4 0 004 4z"/></svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? 'w-5 h-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h6M4 6h.01M4 12h.01M4 18h.01M7 6h.01M7 12h.01M7 18h.01"/></svg>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? 'w-5 h-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414M16.95 16.95l1.414 1.414M6.343 6.343L4.929 4.929"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? 'w-5 h-5'} fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
);

export default BackIcon;
