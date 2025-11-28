import React, { useState } from 'react';
import { Button } from 'antd-mobile';

interface DonationModalProps {
  onClose: () => void;
}

const AlipayIcon = () => (
  <svg viewBox="0 0 1024 1024" className="w-5 h-5 mr-2" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M785.4 724.7C745.2 841 645 922.3 512.4 922.3c-154.6 0-264-106.3-264-263.1 0-165.2 119-270.8 284-270.8 77.1 0 134.1 21.2 173 53.6l-39.2 68.9c-35-26.7-79.6-43.2-132.8-43.2-111.9 0-189.2 73.1-189.2 189.5 0 102.7 66.7 172.9 174.9 172.9 76.6 0 138-42.3 167.3-112.5H516v-78h273.6c2.8 27.6 4.3 56.4 4.3 85.1 0 0-8.5 0-8.5 0zM889.3 274.6h-178V166h-94.2v108.6H392.5v79.1h224.6c-13.6 57.1-43.1 106.9-82.6 148.6-33.1-34.6-58.8-75.1-76.3-120.3h-88c22.6 63.8 58.8 120.3 105.7 167.3-64.4 62.4-142.9 100.9-242 107.5l-22.3 84.8c122.9-13.6 222.9-63.5 301.1-140.7 54.2 56.5 120.6 98.6 193.2 122.6l42.6-83.3c-58.2-18.1-111.3-49.7-156.8-93.5 53.4-53.4 91.5-116.9 111-184.7h186.5v-88.1z" /></svg>
);

const DonationModal: React.FC<DonationModalProps> = ({ onClose }) => {
  const [amount, setAmount] = useState<number>(5);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handlePayment = async () => {
    setStatus('processing');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e) {
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl transform transition-all border border-slate-100 dark:border-slate-700">
        <Button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </Button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#1677FF] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3 text-[#1677FF]">
             <svg viewBox="0 0 1024 1024" className="w-8 h-8" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M785.4 724.7C745.2 841 645 922.3 512.4 922.3c-154.6 0-264-106.3-264-263.1 0-165.2 119-270.8 284-270.8 77.1 0 134.1 21.2 173 53.6l-39.2 68.9c-35-26.7-79.6-43.2-132.8-43.2-111.9 0-189.2 73.1-189.2 189.5 0 102.7 66.7 172.9 174.9 172.9 76.6 0 138-42.3 167.3-112.5H516v-78h273.6c2.8 27.6 4.3 56.4 4.3 85.1 0 0-8.5 0-8.5 0zM889.3 274.6h-178V166h-94.2v108.6H392.5v79.1h224.6c-13.6 57.1-43.1 106.9-82.6 148.6-33.1-34.6-58.8-75.1-76.3-120.3h-88c22.6 63.8 58.8 120.3 105.7 167.3-64.4 62.4-142.9 100.9-242 107.5l-22.3 84.8c122.9-13.6 222.9-63.5 301.1-140.7 54.2 56.5 120.6 98.6 193.2 122.6l42.6-83.3c-58.2-18.1-111.3-49.7-156.8-93.5 53.4-53.4 91.5-116.9 111-184.7h186.5v-88.1z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">赞赏支持</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">感谢您对开发者的支持与鼓励</p>
        </div>
        {status === 'success' ? (
           <div className="text-center py-6 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">支付成功</p>
              <p className="text-sm text-slate-400 mt-1">感谢您的慷慨！</p>
           </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 5, 10].map((amt) => (
                <Button key={amt} onClick={() => setAmount(amt)} className={`py-3 rounded-xl border font-bold transition-all ${amount === amt ? 'border-[#1677FF] bg-[#1677FF] bg-opacity-5 dark:bg-opacity-20 text-[#1677FF]' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'}`}>¥{amt}</Button>
              ))}
              <div className="relative col-span-3">
                 <input type="number" placeholder="自定义金额" className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#1677FF] text-center" onChange={(e) => setAmount(Number(e.target.value))} />
              </div>
            </div>
            <Button block disabled={status === 'processing' || amount <= 0} className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 ${status === 'processing' ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed' : 'bg-[#1677FF] hover:bg-blue-600 shadow-blue-200 dark:shadow-none'}`} onClick={handlePayment}>
              {status === 'processing' ? "正在连接支付宝..." : <> <AlipayIcon /> 立即支付 ¥{amount || 0} </>}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default DonationModal;
