import React, { useRef, useState, useCallback } from 'react';
import { analyzeReceiptOrBasket, type DetectedProduct, type VisionAnalysisResult } from '../services/visionService';
import Loader from './Loader';

interface ImageScannerProps {
  onProductsDetected: (products: DetectedProduct[], metadata?: { store?: string; date?: string; totalAmount?: number }) => void;
  onClose: () => void;
  type: 'receipt' | 'basket';
}

const ImageScanner: React.FC<ImageScannerProps> = ({ onProductsDetected, onClose, type }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Erreur caméra:', err);
      setError('Impossible d\'accéder à la caméra. Veuillez utiliser l\'upload de fichier.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            handleImageAnalysis(file);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
        handleImageAnalysis(file);
      } else {
        setError('Veuillez sélectionner une image valide.');
      }
    }
  }, []);

  const handleImageAnalysis = useCallback(async (image: File | string) => {
    setIsAnalyzing(true);
    setError(null);
    stopCamera();

    try {
      const result: VisionAnalysisResult = await analyzeReceiptOrBasket(image, type);
      
      if (result.products && result.products.length > 0) {
        onProductsDetected(result.products, {
          store: result.store,
          date: result.date,
          totalAmount: result.totalAmount
        });
      } else {
        setError('Aucun produit détecté dans l\'image. Veuillez réessayer avec une photo plus claire.');
        setIsAnalyzing(false);
      }
    } catch (err: any) {
      console.error('Erreur analyse:', err);
      setError(err.message || 'Erreur lors de l\'analyse de l\'image.');
      setIsAnalyzing(false);
    }
  }, [type, onProductsDetected, stopCamera]);

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-fade-in">
      <div className="relative h-full w-full flex flex-col">
        {/* Header */}
        <div className="glass-header p-4 sm:p-5 border-b border-white/10 safe-area-top">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
              {type === 'receipt' ? 'Scanner un Ticket de Caisse' : 'Scanner un Panier'}
            </h2>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2.5 rounded-xl hover:bg-white/10 active:bg-white/5 transition-all touch-feedback min-w-[48px] min-h-[48px]"
              aria-label="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
          {isAnalyzing ? (
            <div className="text-center">
              <Loader />
              <p className="text-white mt-4 text-lg">Analyse de l'image en cours...</p>
              <p className="text-gray-400 mt-2 text-sm">Cela peut prendre quelques secondes</p>
            </div>
          ) : error ? (
            <div className="glass-error rounded-2xl p-6 max-w-md text-center animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-400 text-base mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setPreview(null);
                }}
                className="glass-button text-white font-semibold py-3 px-6 rounded-xl transition-all touch-feedback"
              >
                Réessayer
              </button>
            </div>
          ) : preview ? (
            <div className="w-full max-w-2xl">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          ) : stream ? (
            <div className="w-full max-w-2xl relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-cyan-400 rounded-xl p-2 animate-pulse">
                  <p className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                    {type === 'receipt' ? 'Cadrez le ticket de caisse' : 'Cadrez le panier'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center max-w-md">
              <div className="glass-card p-8 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-cyan-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-xl font-bold text-white mb-2">
                  {type === 'receipt' ? 'Scanner un Ticket' : 'Scanner un Panier'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {type === 'receipt' 
                    ? 'Prenez une photo de votre ticket de caisse pour ajouter automatiquement tous les produits'
                    : 'Prenez une photo de votre panier pour détecter les produits visibles'}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={startCamera}
                    className="glass-button text-white font-semibold py-4 px-6 rounded-xl transition-all touch-feedback min-h-[56px]"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Utiliser la caméra</span>
                    </div>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-input text-white font-semibold py-4 px-6 rounded-xl transition-all touch-feedback min-h-[56px] hover:bg-white/10"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>Choisir une image</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {stream && !isAnalyzing && !error && (
          <div className="glass-header p-4 sm:p-5 border-t border-white/10 safe-area-bottom">
            <div className="flex gap-3 max-w-md mx-auto">
              <button
                onClick={stopCamera}
                className="flex-1 glass-input text-white font-semibold py-4 px-6 rounded-xl hover:bg-white/10 transition-all touch-feedback min-h-[56px]"
              >
                Annuler
              </button>
              <button
                onClick={capturePhoto}
                className="flex-1 glass-button text-white font-semibold py-4 px-6 rounded-xl transition-all touch-feedback min-h-[56px]"
              >
                Prendre la photo
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ImageScanner;

