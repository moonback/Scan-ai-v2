
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-2 border-[#d4ff4c]/30 border-t-[#d4ff4c]"></div>
        <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-2 border-[#68ff9a]/20 border-r-[#68ff9a] absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
    </div>
  );
};

export default Loader;
