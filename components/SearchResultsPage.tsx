import React from 'react';
import { Landmark } from '../types';
import { BackIcon, ChevronRightIcon } from './icons';

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

export default SearchResultsPage;
