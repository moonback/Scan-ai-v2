
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-2 border-cyan-400/30 border-t-cyan-400"></div>
        <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-2 border-blue-400/20 border-r-blue-400 absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
    </div>
  );
};

export default Loader;
