
import React from 'react';
import { type Product } from '../types';

interface ProductDisplayProps {
  product: Product;
  onStartChat: () => void;
  onScanAnother: () => void;
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
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-extrabold text-white bg-gradient-to-br ${gradient} shadow-lg border border-white/30 backdrop-blur-sm`}>
            {text}
        </div>
    );
};


const ProductDisplay: React.FC<ProductDisplayProps> = ({ product, onStartChat, onScanAnother }) => {
  return (
    <div className="p-3 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-y-auto">
        <div className="max-w-lg mx-auto glass-product rounded-2xl overflow-hidden transform transition-all duration-300">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent z-10"></div>
                <img 
                    className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105" 
                    src={product.image_url || 'https://picsum.photos/400/300'} 
                    alt={product.product_name}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/374151/9CA3AF?text=Image+Non+Disponible';
                    }}
                />
                 {product.nutriscore_grade && (
                    <div className="absolute top-3 right-3 z-20 transform hover:scale-110 transition-transform">
                        <NutriScore score={product.nutriscore_grade} />
                    </div>
                 )}
            </div>
            <div className="p-4 space-y-3">
                <div>
                    <div className="uppercase tracking-wide text-xs text-cyan-400 font-semibold mb-1">
                        {product.brands || 'Marque inconnue'}
                    </div>
                    <h2 className="text-xl leading-tight font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {product.product_name}
                    </h2>
                    {product.quantity && (
                        <p className="mt-1 text-xs text-gray-400 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            {product.quantity}
                        </p>
                    )}
                </div>

                <div className="pt-3 border-t border-white/10">
                    <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Ingrédients
                    </h3>
                    <div className="glass-input rounded-lg p-3 max-h-24 overflow-y-auto">
                        <p className="text-gray-300 text-xs leading-relaxed">
                            {product.ingredients_text_with_allergens || 'Aucune information sur les ingrédients disponible.'}
                        </p>
                    </div>
                </div>

                <div className="pt-3 flex flex-col gap-2">
                    <button 
                        onClick={onStartChat} 
                        className="w-full glass-button text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.01] flex items-center justify-center gap-2 text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                        </svg>
                        <span>Poser une Question à l'IA</span>
                    </button>
                    <button 
                        onClick={onScanAnother} 
                        className="w-full glass-input text-white font-medium py-2 px-4 rounded-xl hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Scanner un Autre Produit</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProductDisplay;
