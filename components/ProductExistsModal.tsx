import React from 'react';
import { type Product } from '../types';
import { type FrigoItem } from '../services/frigoService';

interface ProductExistsModalProps {
  product: Product;
  existingItem: FrigoItem;
  onAddToExisting: () => void;
  onModify: () => void;
  onViewProduct: () => void;
  onClose: () => void;
}

const ProductExistsModal: React.FC<ProductExistsModalProps> = ({
  product,
  existingItem,
  onAddToExisting,
  onModify,
  onViewProduct,
  onClose
}) => {
  const getDaysUntilExpiry = () => {
    if (!existingItem.dlc) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dlcDate = new Date(existingItem.dlc);
    dlcDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dlcDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto smooth-scroll animate-bounce-in shadow-2xl border-2 border-cyan-400/30">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-yellow-400">
                Produit Déjà Enregistré
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Ce produit est dans votre frigo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 active:bg-white/5 transition-all touch-feedback"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Info */}
        <div className="mb-5 glass-input rounded-xl p-4 border-2 border-yellow-400/20">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={product.image_url || 'https://via.placeholder.com/60/374151/9CA3AF?text=?'}
              alt={product.product_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white/10 shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80/374151/9CA3AF?text=?';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-base sm:text-lg font-bold text-white truncate mb-1">{product.product_name}</p>
              <p className="text-sm text-gray-400 truncate">{product.brands || 'Marque inconnue'}</p>
            </div>
          </div>

          {/* Current Stock Info */}
          <div className="space-y-2 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Quantité actuelle
              </span>
              <span className="font-bold text-cyan-400">x{existingItem.quantity || 1}</span>
            </div>

            {existingItem.category && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Catégorie
                </span>
                <span className="font-semibold text-white">{existingItem.category}</span>
              </div>
            )}

            {existingItem.dlc && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  DLC
                </span>
                <span className={`font-semibold ${
                  daysUntilExpiry !== null && daysUntilExpiry < 0
                    ? 'text-red-400'
                    : daysUntilExpiry !== null && daysUntilExpiry <= 3
                    ? 'text-yellow-400'
                    : 'text-green-400'
                }`}>
                  {new Date(existingItem.dlc).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {daysUntilExpiry !== null && (
                    <span className="text-xs ml-1">
                      ({daysUntilExpiry < 0 ? `expiré` : daysUntilExpiry === 0 ? `aujourd'hui` : `${daysUntilExpiry}j`})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onAddToExisting}
            className="w-full glass-button text-white font-semibold py-4 px-6 rounded-xl sm:rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 text-sm sm:text-base touch-feedback min-h-[56px] shadow-lg hover:shadow-cyan-500/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Ajouter au Stock Existant</span>
          </button>

          <button
            onClick={onModify}
            className="w-full glass-input text-white font-semibold py-4 px-6 rounded-xl sm:rounded-2xl hover:bg-white/10 active:bg-white/5 transition-all duration-200 flex items-center justify-center gap-2.5 text-sm sm:text-base touch-feedback min-h-[56px] border-2 border-cyan-400/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Modifier la Fiche</span>
          </button>

          <button
            onClick={onViewProduct}
            className="w-full glass-input text-gray-300 font-medium py-3 px-6 rounded-xl hover:bg-white/5 active:bg-white/5 transition-all duration-200 flex items-center justify-center gap-2.5 text-sm touch-feedback"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Voir les Détails du Produit</span>
          </button>

          <button
            onClick={onClose}
            className="w-full text-gray-400 hover:text-white font-medium py-2 rounded-lg hover:bg-white/5 transition-all text-sm"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductExistsModal;

