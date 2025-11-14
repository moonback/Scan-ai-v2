
import React, { useState, useCallback } from 'react';
import Loader from './Loader';
import CameraScanner from './CameraScanner';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isLoading: boolean;
  error: string | null;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, isLoading, error }) => {
  const [barcode, setBarcode] = useState('');
  const [inputError, setInputError] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits
    if (/^\d*$/.test(value)) {
      setBarcode(value);
      if (inputError) setInputError('');
    }
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.length !== 13) {
      setInputError('Le code-barres EAN-13 doit contenir exactement 13 chiffres.');
      return;
    }
    setInputError('');
    onScan(barcode);
  }, [barcode, onScan]);

  return (
    <>
      {showCamera && (
        <CameraScanner
          onDetected={(code) => {
            setBarcode(code);
            setShowCamera(false);
            onScan(code);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="safe-area-top safe-area-bottom flex h-full flex-col overflow-y-auto bg-transparent px-3 py-4 text-left sm:px-8 md:px-10">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 animate-fade-in sm:gap-5">
          <div className="hero-spotlight rounded-[26px] p-4 text-slate-800 shadow-inner sm:rounded-[30px] sm:p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="glass-icon flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM4 12h16M12 4v16" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Assistant IA</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Scanner un nouveau produit</h2>
                <p className="text-sm text-slate-500">
                  Capturez un code-barres ou saisissez-le pour analyser instantanément les informations clés.
                </p>
              </div>
            </div>
            
          </div>

          <div className="glass-card rounded-[26px] p-4 shadow-xl sm:rounded-[30px] sm:p-6">
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold text-slate-900">Code-barres EAN-13</h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="glass-button flex items-center justify-center gap-3 rounded-2xl py-4 text-base font-semibold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Scanner avec la caméra
                </button>

                
              </div>

              <form 
                onSubmit={handleSubmit} 
                className="flex flex-col gap-3 sm:gap-4"
                aria-label="Entrer un code-barres manuellement"
                autoComplete="off"
                spellCheck={false}
              >
                <label 
                  htmlFor="barcode-input"
                  className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
                >
                  Saisie manuelle
                </label>
                <div className="relative">
                  <input
                    id="barcode-input"
                    type="tel"
                    inputMode="numeric"
                    pattern="\d{13}"
                    value={barcode}
                    onChange={handleInputChange}
                    placeholder="0000 0000 0000 0"
                    maxLength={13}
                    className="w-full glass-input text-center text-lg font-mono tracking-[0.4em] text-slate-900 placeholder:text-slate-400 sm:text-2xl sm:tracking-[0.55em] aria-[invalid='true']:ring-2 aria-[invalid='true']:ring-red-400"
                    aria-invalid={!!inputError}
                    aria-describedby={inputError ? "barcode-error" : undefined}
                    autoFocus
                  />
                  <span className="stat-chip absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-[11px] font-semibold text-slate-500 select-none" aria-live="polite">
                    {barcode.length}/13
                  </span>
                </div>

                {inputError && (
                  <div
                    id="barcode-error"
                    className="glass-error rounded-2xl p-3 text-sm text-red-500"
                    role="alert"
                  >
                    <p className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{inputError}</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || barcode.length !== 13}
                  aria-disabled={isLoading || barcode.length !== 13}
                  className="glass-button flex items-center justify-center gap-3 rounded-2xl py-4 text-base font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader />
                      <span>Recherche en cours…</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Lancer la recherche</span>
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="glass-error rounded-2xl p-3 text-sm text-red-500">
                  <p className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BarcodeScanner;
