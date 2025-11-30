import React from 'react';
import { User } from '../types';
import { SunIcon, MoonIcon, UserIcon, KeyIcon, EditIcon, ChevronRightIcon } from './icons';

interface ProfileViewProps {
  user: User | null;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setSubPage: (page: any) => void;
  setShowDonation: (val: boolean) => void;
  handleLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  user, isDarkMode, toggleTheme, setSubPage, setShowDonation, handleLogout
}) => (
    <div className="pb-40 animate-fadeIn scrollbar-hide">
      <div className="sticky top-0 z-50 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md pt-14 pb-4 px-6 flex items-center justify-between transition-colors">
         <h1 className="text-2xl font-bold text-slate-800 dark:text-white">个人中心</h1>
         <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
             {isDarkMode ? <SunIcon /> : <MoonIcon />}
         </button>
      </div>

      <div className="px-6 mt-4">
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

export default ProfileView;
