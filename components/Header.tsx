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
    <header
      className={`
        glass-header safe-area-top sticky top-0 z-50 border-b border-white/10
        transition-all duration-300
        ${scrolled ? 'shadow-[0_20px_45px_rgba(15,23,42,0.15)]' : 'shadow-none'}
      `}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-1 py-1.5 sm:px-2 sm:py-2">
        <div className="flex min-w-[52px] justify-start">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/40 bg-white/80 text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/60 hover:text-[var(--accent)] focus-visible:outline-none sm:h-11 sm:w-11"
              aria-label="Retour"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transition-transform duration-150 group-active:-translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-1 text-center">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e0eeff] to-white shadow-inner border border-slate-200/80"
              aria-label="Validé par IA"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[var(--accent)] drop-shadow"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  fill="#e0eaff"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.3}
                  d="M9 12.5l2 2.2 4-4.7"
                  stroke="#2563eb"
                  fill="none"
                />
              </svg>
            </div>
            <h1
              className={`
                text-base font-semibold tracking-tight text-slate-900 sm:text-lg lg:text-xl
                transition-all duration-300 select-none
                ${animateTitle ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100'}
              `}
              aria-live="polite"
            >
              {title}
            </h1>
          </div>
        </div>

        <div className="flex min-w-[52px] justify-end">
          {showFrigo && onFrigoClick && (
            <button
              onClick={onFrigoClick}
              className="relative hidden h-10 w-auto items-center gap-2 rounded-2xl border border-white/40 bg-white/80 px-3 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/60 hover:text-[var(--accent)] md:inline-flex lg:h-11"
              aria-label="Mon Frigo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="hidden lg:inline">Frigo</span>
              {frigoCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-7 min-w-[26px] items-center justify-center rounded-full border border-white/60 bg-gradient-to-r from-[#4f46e5] to-[#0ea5e9] px-1 text-xs font-bold text-white shadow-lg">
                  {frigoCount > 99 ? '99+' : frigoCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto mt-2 h-[2px] w-32 max-w-[45%] rounded-full bg-gradient-to-r from-transparent via-[#4f46e5] to-transparent" />
    </header>
  );
};

export default Header;
