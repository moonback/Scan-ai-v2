
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
      
      <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center overflow-y-auto safe-area-top safe-area-bottom smooth-scroll animate-fade-in">
        <div className="w-full max-w-md glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl animate-scale-in">
        <div className="mb-5 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 glass-icon rounded-2xl flex items-center justify-center shadow-lg animate-pulse-slow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Scanner un Produit
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">Entrez le code-barres EAN-13</p>
        </div>

        {/* Camera Button */}
        <button
          type="button"
          onClick={() => setShowCamera(true)}
          className="w-full glass-button text-white font-semibold py-4 px-4 rounded-xl sm:rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 transform hover:scale-[1.02] mb-4 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm sm:text-base">Scanner avec la Caméra</span>
        </button>

        <div className="relative flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-xs text-gray-400 px-2">OU</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              value={barcode}
              onChange={handleInputChange}
              placeholder="Entrez le code-barres (13 chiffres)"
              maxLength={13}
              className="w-full glass-input text-white placeholder-gray-400 text-center text-lg sm:text-xl p-4 sm:p-5 rounded-xl sm:rounded-2xl font-mono tracking-widest focus:ring-2 focus:ring-cyan-400/50 transition-all text-lg"
              inputMode="numeric"
              pattern="\d{13}"
              autoComplete="off"
            />
            {barcode.length > 0 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm text-gray-400 font-medium">
                {barcode.length}/13
              </div>
            )}
          </div>
          {inputError && (
            <div className="glass-error rounded-xl p-3 animate-fade-in">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {inputError}
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading || barcode.length !== 13}
            className="w-full glass-button text-white font-semibold py-4 sm:py-5 px-6 rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base sm:text-lg touch-feedback min-h-[56px]"
          >
            {isLoading ? (
              <>
                <Loader />
                <span>Recherche...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Rechercher</span>
              </>
            )}
          </button>
        </form>
        {error && (
          <div className="mt-4 glass-error rounded-xl p-3 animate-fade-in">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default BarcodeScanner;
