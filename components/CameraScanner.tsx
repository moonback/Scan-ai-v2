import React, { useRef, useEffect, useState } from 'react';

interface CameraScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onDetected, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Erreur caméra:', err);
        setError('Impossible d\'accéder à la caméra. Veuillez vérifier les autorisations.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleManualInput = () => {
    setIsScanning(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-fade-in">
      <div className="relative h-full w-full flex flex-col">
        {/* Header */}
        <div className="glass-header p-4 sm:p-5 border-b border-white/10 safe-area-top">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Scanner un Code-Barres
            </h2>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-slate-100 active:bg-slate-50 transition-all touch-feedback min-w-[48px] min-h-[48px]"
              aria-label="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Camera View */}
        <div className="flex-1 relative overflow-hidden">
          {error ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="glass-error rounded-2xl p-6 max-w-md text-center animate-shake">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-400 text-base mb-4">{error}</p>
                <button
                  onClick={handleManualInput}
                  className="glass-button text-white font-semibold py-3 px-6 rounded-xl transition-all touch-feedback"
                >
                  Saisir manuellement
                </button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Scan Frame */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-40 sm:w-80 sm:h-48 border-2 border-[#d4ff4c] rounded-2xl relative animate-glow">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#d4ff4c] rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#d4ff4c] rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#d4ff4c] rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#d4ff4c] rounded-br-xl"></div>
                    
                    {/* Scan Line */}
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#d4ff4c] to-transparent animate-pulse"></div>
                  </div>
                  
                  <p className="text-center text-slate-900 text-sm sm:text-base mt-6 px-4">
                    Placez le code-barres dans le cadre
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="glass-header p-4 sm:p-5 border-t border-white/10 safe-area-bottom">
          <div className="flex gap-3 max-w-md mx-auto">
            <button
              onClick={handleManualInput}
              className="flex-1 glass-input text-slate-900 font-semibold py-4 px-6 rounded-xl sm:rounded-2xl hover:bg-slate-100 active:bg-slate-50 transition-all touch-feedback text-sm sm:text-base min-h-[56px]"
            >
              Saisir manuellement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;

