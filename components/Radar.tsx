import React from 'react';

interface RadarProps {
  scanning: boolean;
}

const Radar: React.FC<RadarProps> = ({ scanning }) => {
  return (
    <div className="relative flex items-center justify-center w-24 h-24 mb-6">
      {/* Outer ring */}
      <div className={`absolute w-full h-full bg-teal-500 rounded-full opacity-20 dark:opacity-30 ${scanning ? 'animate-ping-slow' : ''}`}></div>
      {/* Inner pulsing ring */}
      <div className={`absolute w-3/4 h-3/4 bg-teal-500 rounded-full opacity-30 dark:opacity-40 ${scanning ? 'animate-pulse-slow' : ''}`}></div>
      {/* Center Icon */}
      <div className="relative z-10 w-12 h-12 bg-gradient-to-tr from-teal-600 to-emerald-400 rounded-full shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    </div>
  );
};

export default Radar;