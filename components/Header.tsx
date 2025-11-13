
import React from 'react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showFrigo?: boolean;
  onFrigoClick?: () => void;
  frigoCount?: number;
}

const Header: React.FC<HeaderProps> = ({ title, showBack, onBack, showFrigo, onFrigoClick, frigoCount = 0 }) => {
  return (
    <header className="glass-header p-3 sm:p-4 shadow-xl sticky top-0 z-50 safe-area-top">
      <div className="flex items-center justify-center relative max-w-4xl mx-auto px-3 sm:px-4">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="absolute left-0 p-2.5 sm:p-3 rounded-xl hover:bg-white/10 active:bg-white/5 transition-all duration-200 group touch-feedback min-w-[48px] min-h-[48px]"
            aria-label="Retour"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-gray-300 group-hover:text-cyan-400 transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 glass-icon rounded-xl flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        {showFrigo && onFrigoClick && (
          <button
            onClick={onFrigoClick}
            className="absolute right-0 p-2.5 sm:p-3 rounded-xl hover:bg-white/10 active:bg-white/5 transition-all duration-200 group relative touch-feedback min-w-[48px] min-h-[48px]"
            aria-label="Mon Frigo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {frigoCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-gray-900">
                {frigoCount > 9 ? '9+' : frigoCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
