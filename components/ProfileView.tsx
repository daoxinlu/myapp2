import React from 'react';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
);

interface User {
  id: string;
  name: string;
  email: string;
  level: string;
  isVip: boolean;
  avatarColor: string;
  bio?: string;
}

const ProfileView: React.FC<{ user: User | null; isDarkMode: boolean; toggleTheme: () => void; setSubPage: (page: any) => void; setShowDonation: (val: boolean) => void; handleLogout: () => void; }> = ({ user, isDarkMode, toggleTheme, setSubPage, setShowDonation, handleLogout }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 animate-fadeIn">
            <div className="px-6 pt-16">
                <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${user?.avatarColor || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white text-2xl font-bold mr-4`}> {user?.name?.charAt(0) || '访'} </div>
                    <div>
                        <div className="font-bold text-lg text-slate-800 dark:text-white">{user?.name || '游客'}</div>
                        <div className="text-sm text-slate-400">{user?.level || 'Lv.1'}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button onClick={() => setSubPage('voice_settings')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm">语音偏好</button>
                    <button onClick={() => setSubPage('api_key_settings')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm">服务配置 (API Keys)</button>
                    <button onClick={() => setShowDonation(true)} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm">赞赏开发者</button>
                </div>

                <div className="mt-8">
                    <button onClick={handleLogout} className="w-full mt-8 py-3 rounded-xl border border-red-100 text-red-500 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 font-bold text-sm">退出登录</button>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
