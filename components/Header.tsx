
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
    <header className="glass-header p-2 sm:p-3 shadow-lg sticky top-0 z-10">
      <div className="flex items-center justify-center relative max-w-4xl mx-auto px-2 sm:px-0">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="absolute left-0 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 group"
            aria-label="Retour"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-300 group-hover:text-cyan-400 transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 glass-icon rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        {showFrigo && onFrigoClick && (
          <button
            onClick={onFrigoClick}
            className="absolute right-0 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 group relative"
            aria-label="Mon Frigo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {frigoCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
