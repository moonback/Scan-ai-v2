import React, { useState, useEffect } from 'react';
import { type Product } from '../types';
import { frigoService, type FrigoItem } from '../services/frigoService';
import PriceHistoryModal from './PriceHistoryModal';

interface ProductDisplayProps {
  product: Product;
  onStartChat: () => void;
  onScanAnother: () => void;
  onAddToFrigo?: () => void;
}

const NutriScore: React.FC<{ score: string }> = ({ score }) => {
    const scoreMap: { [key: string]: { color: string, text: string, gradient: string } } = {
        'a': { color: 'bg-green-500', text: 'A', gradient: 'from-green-500 to-emerald-600' },
        'b': { color: 'bg-lime-500', text: 'B', gradient: 'from-lime-500 to-green-600' },
        'c': { color: 'bg-yellow-500', text: 'C', gradient: 'from-yellow-500 to-orange-500' },
        'd': { color: 'bg-orange-500', text: 'D', gradient: 'from-orange-500 to-red-500' },
        'e': { color: 'bg-red-500', text: 'E', gradient: 'from-red-500 to-rose-600' },
    };
    const { color, text, gradient } = scoreMap[score.toLowerCase()] || { color: 'bg-gray-500', text: '?', gradient: 'from-gray-500 to-gray-600' };
    return (
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-extrabold text-white bg-gradient-to-br ${gradient} shadow-xl border-2 border-white/40 backdrop-blur-sm`}>
            {text}
        </div>
    );
};


const ProductDisplay: React.FC<ProductDisplayProps> = ({ product, onStartChat, onScanAnother, onAddToFrigo }) => {
  const [frigoItem, setFrigoItem] = useState<FrigoItem | null>(null);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showNutriments, setShowNutriments] = useState(false);

  useEffect(() => {
    // Vérifier si le produit est dans le frigo
    const item = frigoService.getByProduct(product);
    setFrigoItem(item);
  }, [product]);

  const hasHistory = frigoItem?.priceHistory && frigoItem.priceHistory.length > 0;
  
  const getPriceVariation = () => {
    if (!frigoItem?.priceHistory || frigoItem.priceHistory.length < 2) return null;
    
    const latest = frigoItem.priceHistory[frigoItem.priceHistory.length - 1];
    const previous = frigoItem.priceHistory[frigoItem.priceHistory.length - 2];
    
    const diff = latest.price - previous.price;
    const percentage = ((diff / previous.price) * 100).toFixed(1);
    
    return { diff, percentage };
  };

  const mainNutriments = [
    { key: 'energy-kcal_100g', label: 'Énergie', unit: 'kcal', icon: '⚡' },
    { key: 'fat_100g', label: 'Matières grasses', unit: 'g', icon: '🧈' },
    { key: 'saturated-fat_100g', label: 'Acides gras saturés', unit: 'g', icon: '🔴' },
    { key: 'carbohydrates_100g', label: 'Glucides', unit: 'g', icon: '🍞' },
    { key: 'sugars_100g', label: 'Sucres', unit: 'g', icon: '🍬' },
    { key: 'proteins_100g', label: 'Protéines', unit: 'g', icon: '💪' },
    { key: 'salt_100g', label: 'Sel', unit: 'g', icon: '🧂' },
    { key: 'fiber_100g', label: 'Fibres', unit: 'g', icon: '🌾' },
  ];

  const variation = getPriceVariation();

  return (
    <>
      {showPriceHistory && frigoItem && (
        <PriceHistoryModal 
          item={frigoItem}
          onClose={() => setShowPriceHistory(false)}
        />
      )}
    <div className="h-full overflow-y-auto smooth-scroll safe-area-top safe-area-bottom bg-[var(--app-bg)]">
        <div className="min-h-full p-3 sm:p-4 pb-20 sm:pb-24">
        <div className="max-w-lg mx-auto glass-product rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-in shadow-2xl">
            <div className="relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/70 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90"></div>
                <img 
                    className="w-full h-40 sm:h-56 object-cover transition-transform duration-700 group-hover:scale-110" 
                    src={product.image_url || 'https://picsum.photos/400/300'} 
                    alt={product.product_name}
                    loading="lazy"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/374151/9CA3AF?text=Image+Non+Disponible';
                    }}
                />
                 {product.nutriscore_grade && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 transform hover:scale-125 transition-all duration-300 hover:rotate-12 animate-bounce-in">
                        <NutriScore score={product.nutriscore_grade} />
                    </div>
                 )}
            </div>
            <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div>
                    <div className="uppercase tracking-wider text-xs text-[#d4ff4c] font-semibold mb-1">
                        {product.brands || 'Marque inconnue'}
                    </div>
                    <h2 className="text-lg sm:text-xl leading-tight font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-1">
                        {product.product_name}
                    </h2>
                    {product.quantity && (
                        <p className="mt-1.5 text-xs sm:text-sm text-gray-400 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            {product.quantity}
                        </p>
                    )}
                </div>

                {/* Info Frigo - Prix et Magasin */}
                {frigoItem && (frigoItem.price || frigoItem.store) && (
                    <div className="glass-input border-2 border-[#d4ff4c]/30 rounded-xl p-3 space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4ff4c] via-[#68ff9a] to-[#32d2a1] flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Dans votre frigo</p>
                                    {frigoItem.quantity && (
                                        <p className="text-xs font-semibold text-[#d4ff4c]">Quantité: {frigoItem.quantity}</p>
                                    )}
                                </div>
                            </div>
                            {hasHistory && (
                                <button
                                    onClick={() => setShowPriceHistory(true)}
                                    className="px-3 py-1.5 glass-button text-xs font-medium rounded-lg flex items-center gap-1.5 touch-feedback"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Historique
                                </button>
                            )}
                        </div>
                        
                        {frigoItem.price && (
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-base font-bold text-green-400">{frigoItem.price.toFixed(2)} €</span>
                                </div>
                                {variation && (
                                    <div className={`
                                        flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold
                                        ${variation.diff > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}
                                    `}>
                                        {variation.diff > 0 ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        )}
                                        <span>{variation.percentage}%</span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {frigoItem.store && (
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#d4ff4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span>{frigoItem.store}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Valeurs Nutritionnelles */}
                {product.nutriments && Object.keys(product.nutriments).length > 0 && (
                    <div className="pt-3 border-t border-white/10">
                        <button
                            onClick={() => setShowNutriments(!showNutriments)}
                            className="w-full flex items-center justify-between mb-2 group"
                        >
                            <h3 className="text-sm sm:text-base font-semibold text-slate-500 flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#d4ff4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Valeurs Nutritionnelles
                            </h3>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-5 w-5 text-gray-400 group-hover:text-[#d4ff4c] transition-all ${showNutriments ? 'rotate-180' : ''}`}
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {showNutriments && (
                            <div className="glass-input rounded-xl p-3 space-y-2 animate-slide-up">
                                <p className="text-xs text-gray-400 mb-2">Pour 100g / 100ml</p>
                                {mainNutriments.map((nutriment) => {
                                    const value = product.nutriments[nutriment.key];
                                    if (value === undefined || value === null) return null;
                                    return (
                                        <div key={nutriment.key} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{nutriment.icon}</span>
                                                <span className="text-xs sm:text-sm text-gray-300">{nutriment.label}</span>
                                            </div>
                                            <span className="text-xs sm:text-sm font-semibold text-slate-900">
                                                {typeof value === 'number' ? value.toFixed(1) : value} {nutriment.unit}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <div className="pt-3 border-t border-white/10">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#d4ff4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Ingrédients
                    </h3>
                    <div className="glass-input rounded-xl p-3 max-h-28 overflow-y-auto smooth-scroll">
                        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                            {product.ingredients_text_with_allergens || 'Aucune information sur les ingrédients disponible.'}
                        </p>
                    </div>
                </div>

                <div className="pt-3 flex flex-col gap-2.5">
                    {onAddToFrigo && (
                        <button 
                            onClick={onAddToFrigo} 
                            className="w-full glass-button text-white font-semibold py-3.5 px-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base touch-feedback min-h-[50px] shadow-lg hover:shadow-[rgba(104,255,154,0.45)]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span>Ajouter au Frigo</span>
                        </button>
                    )}
                    <button 
                        onClick={onStartChat} 
                        className="w-full glass-button text-white font-semibold py-3.5 px-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base touch-feedback min-h-[50px] shadow-lg hover:shadow-[rgba(104,255,154,0.45)]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                        </svg>
                        <span>Question à l'IA</span>
                    </button>
                    <button 
                        onClick={onScanAnother} 
                        className="w-full glass-input text-slate-900 font-medium py-3 px-4 rounded-xl hover:bg-slate-100 transition-all duration-200 flex items-center justify-center gap-2 text-sm touch-feedback min-h-[48px]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Scanner Autre Produit</span>
                    </button>
                </div>
            </div>
        </div>
        </div>
    </div>
    </>
  );
};

export default ProductDisplay;
