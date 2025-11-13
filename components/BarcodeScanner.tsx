
import React, { useState, useCallback } from 'react';
import Loader from './Loader';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isLoading: boolean;
  error: string | null;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, isLoading, error }) => {
  const [barcode, setBarcode] = useState('');
  const [inputError, setInputError] = useState('');

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
    <div className="flex flex-col items-center justify-center h-full p-3 text-center overflow-y-auto">
      <div className="w-full max-w-md glass-card p-5 rounded-2xl">
        <div className="mb-4">
          <div className="w-14 h-14 mx-auto mb-3 glass-icon rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Scanner un Produit
          </h2>
          <p className="text-gray-400 text-xs">Entrez le code-barres EAN-13</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              value={barcode}
              onChange={handleInputChange}
              placeholder="Entrez le code-barres (13 chiffres)"
              maxLength={13}
              className="w-full glass-input text-white placeholder-gray-400 text-center text-lg p-3 rounded-xl font-mono tracking-widest focus:ring-2 focus:ring-cyan-400/50 transition-all"
              inputMode="numeric"
              pattern="\d{13}"
            />
            {barcode.length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {barcode.length}/13
              </div>
            )}
          </div>
          {inputError && (
            <div className="glass-error rounded-lg p-2">
              <p className="text-red-400 text-xs flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {inputError}
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading || barcode.length !== 13}
            className="w-full glass-button text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.01] disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader />
                <span className="text-sm">Recherche...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm">Rechercher</span>
              </>
            )}
          </button>
        </form>
        {error && (
          <div className="mt-3 glass-error rounded-lg p-2">
            <p className="text-red-400 text-xs flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
