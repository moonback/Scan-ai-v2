import React, { useState, useEffect } from 'react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showFrigo?: boolean;
  onFrigoClick?: () => void;
  frigoCount?: number;
}

const Header: React.FC<HeaderProps> = ({ title, showBack, onBack, showFrigo, onFrigoClick, frigoCount = 0 }) => {
  const [scrolled, setScrolled] = useState(false);
  const [prevTitle, setPrevTitle] = useState(title);
  const [animateTitle, setAnimateTitle] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (title !== prevTitle) {
      setAnimateTitle(true);
      const timer = setTimeout(() => {
        setPrevTitle(title);
        setAnimateTitle(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [title, prevTitle]);

  return (
    <header className={`
      glass-header p-3 sm:p-4 sticky top-0 z-50 safe-area-top
      transition-all duration-300
      ${scrolled ? 'border-b border-white/10 shadow-[0_10px_25px_rgba(15,23,42,0.1)]' : 'border-b border-transparent'}
    `}>
      <div className="flex items-center justify-between relative max-w-5xl mx-auto px-2 sm:px-4">
        {/* Bouton Retour */}
        <div className="flex-shrink-0 w-12">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="p-2.5 sm:p-3 rounded-xl hover:bg-slate-100 active:bg-slate-50 transition-all duration-200 group touch-feedback min-w-[48px] min-h-[48px] animate-fade-in border border-transparent hover:border-white/10"
              aria-label="Retour"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-slate-500 group-hover:text-[#d4ff4c] group-active:scale-90 transition-all" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Titre Central */}
        <div className="flex-1 flex items-center justify-center gap-2.5 sm:gap-3 overflow-hidden">
          <div className="w-9 h-9 sm:w-10 sm:h-10 glass-icon rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-[#d4ff4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className={`
            text-base sm:text-lg lg:text-xl font-semibold text-slate-900 tracking-tight
            truncate transition-all duration-300 uppercase
            ${animateTitle ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}
          `}>
            {title}
          </h1>
        </div>

        {/* Bouton Frigo (masqué sur mobile car dans bottom nav) */}
        <div className="flex-shrink-0 w-12">
          {showFrigo && onFrigoClick && (
            <button
              onClick={onFrigoClick}
              className="hidden md:flex p-2.5 sm:p-3 rounded-xl hover:bg-slate-100 active:bg-slate-50 transition-all duration-200 group relative touch-feedback min-w-[48px] min-h-[48px] items-center justify-center border border-transparent hover:border-white/10"
              aria-label="Mon Frigo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 group-hover:text-[#d4ff4c] group-active:scale-90 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {frigoCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#d4ff4c] to-[#68ff9a] text-[#050505] text-xs font-bold rounded-full min-w-[24px] h-6 px-1.5 flex items-center justify-center shadow-lg border-2 border-[#050608] animate-scale-in">
                  {frigoCount > 99 ? '99+' : frigoCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Barre de progression decorative */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#d4ff4c]/50 to-transparent" />
    </header>
  );
};

export default Header;
