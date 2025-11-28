import React from 'react';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
);

const CategoryListPage: React.FC<{ category: string, onBack: () => void }> = ({ category, onBack }) => {
    const getCategoryData = () => {
        switch(category) {
            case 'food':
                return {
                    title: '周边美食',
                    items: [
                        { id: 'f1', title: '老北京炸酱面', desc: '地道风味，面条劲道', rating: 4.8, price: '¥35/人', dist: '500m', tag: '老字号', imgColor: 'from-orange-400 to-red-500' },
                        { id: 'f2', title: '四季民福烤鸭', desc: '皮酥肉嫩，果木炭火', rating: 4.9, price: '¥180/人', dist: '1.2km', tag: '必吃榜', imgColor: 'from-red-500 to-rose-600' },
                        { id: 'f3', title: '门框胡同卤煮', desc: '百年传承，汤浓味厚', rating: 4.5, price: '¥45/人', dist: '800m', tag: '特色小吃', imgColor: 'from-amber-500 to-orange-600' },
                        { id: 'f4', title: '东来顺饭庄', desc: '铜锅涮肉，选料精细', rating: 4.7, price: '¥1200起', dist: '2.5km', tag: '非遗美食', imgColor: 'from-teal-500 to-green-600' }
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
            <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 border-b border-slate-100 dark:border-slate-800 pt-12 pb-3 px-4">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <BackIcon />
                    </button>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white ml-2">{data.title}</h2>
                </div>
            </div>

            <div className="pt-24 px-4">
                <div className="grid gap-4">
                    {data.items.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-800 dark:text-white">{item.title}</h3>
                                <span className="text-xs text-slate-400">{(item as any).dist || ''}</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryListPage;
