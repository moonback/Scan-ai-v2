
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-2 border-[#2563eb]/30 border-t-[#2563eb]"></div>
        <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-2 border-[#38bdf8]/20 border-r-[#38bdf8] absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
    </div>
  );
};

export default Loader;
