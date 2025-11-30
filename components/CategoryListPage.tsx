import React from 'react';
import { BackIcon, StarIcon } from './icons';

interface CategoryListPageProps {
  category: string;
  onBack: () => void;
}

const CategoryListPage: React.FC<CategoryListPageProps> = ({ category, onBack }) => {
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

export default CategoryListPage;

