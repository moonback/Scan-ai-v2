
import React, { useState, useEffect, useMemo } from 'react';
import { type Product } from '../types';
import { frigoService, type FrigoItem, type FrigoCategory } from '../services/frigoService';
import Loader from './Loader';

interface FrigoProps {
  onProductSelect: (product: Product) => void;
  onBack: () => void;
  onFrigoChange?: () => void;
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
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-extrabold text-white bg-gradient-to-br ${gradient} shadow-lg border border-white/30 backdrop-blur-sm`}>
            {text}
        </div>
    );
};

const Frigo: React.FC<FrigoProps> = ({ onProductSelect, onBack, onFrigoChange }) => {
  const [items, setItems] = useState<FrigoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<FrigoCategory | 'Tous'>('Tous');

  useEffect(() => {
    loadFrigo();
  }, []);

  const loadFrigo = () => {
    setIsLoading(true);
    const frigoItems = frigoService.getAll();
    setItems(frigoItems);
    setIsLoading(false);
  };

  const categories = useMemo(() => frigoService.getCategories(), [items]);
  const expiredItems = useMemo(() => frigoService.getExpired(), [items]);
  const expiringSoonItems = useMemo(() => frigoService.getExpiringSoon(), [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Tous') {
      return items;
    }
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const getDlcStatus = (item: FrigoItem) => {
    if (!item.dlc) return null;
    const dlcDate = new Date(item.dlc);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dlcDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dlcDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { type: 'expired', days: Math.abs(diffDays) };
    if (diffDays <= 3) return { type: 'soon', days: diffDays };
    return { type: 'ok', days: diffDays };
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Voulez-vous retirer ce produit du frigo ?')) {
      frigoService.remove(id);
      loadFrigo();
      onFrigoChange?.();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Voulez-vous vider complètement votre frigo ? Cette action est irréversible.')) {
      frigoService.clear();
      loadFrigo();
      onFrigoChange?.();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-y-auto h-full">
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-full text-center">
          <div className="w-24 h-24 glass-icon rounded-2xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Votre Frigo est Vide
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            Scannez des produits et ajoutez-les à votre frigo virtuel pour les retrouver facilement !
          </p>
          <button
            onClick={onBack}
            className="glass-button text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scanner un Produit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-3 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-y-auto h-full">
      <div className="max-w-6xl mx-auto">
        {/* Alertes DLC */}
        {(expiredItems.length > 0 || expiringSoonItems.length > 0) && (
          <div className="mb-3 space-y-2">
            {expiredItems.length > 0 && (
              <div className="glass-error p-3 rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-400">
                    {expiredItems.length} produit{expiredItems.length > 1 ? 's' : ''} expiré{expiredItems.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
            {expiringSoonItems.length > 0 && (
              <div className="glass-input border border-yellow-500/30 p-3 rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-400">
                    {expiringSoonItems.length} produit{expiringSoonItems.length > 1 ? 's' : ''} expire{expiringSoonItems.length > 1 ? 'nt' : ''} bientôt
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Header avec statistiques */}
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="truncate">Mon Frigo ({items.length} {items.length > 1 ? 'produits' : 'produit'})</span>
            </h2>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="glass-input text-red-400 hover:text-red-300 font-medium py-1.5 px-2 sm:px-3 rounded-lg transition-all duration-200 text-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Vider le frigo</span>
              <span className="sm:hidden">Vider</span>
            </button>
          )}
        </div>

        {/* Filtres par catégorie */}
        {categories.length > 0 && (
          <div className="mb-3 sm:mb-4 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              <button
                onClick={() => setSelectedCategory('Tous')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'Tous'
                    ? 'glass-button text-white'
                    : 'glass-input text-gray-300 hover:text-white'
                }`}
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'glass-button text-white'
                      : 'glass-input text-gray-300 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grille de produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
          {filteredItems.map((item) => {
            const dlcStatus = getDlcStatus(item);
            return (
            <div
              key={item.id}
              className="glass-product rounded-lg sm:rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              onClick={() => onProductSelect(item.product)}
            >
              <div className="relative">
                <img
                  className="w-full h-28 sm:h-32 object-cover"
                  src={item.product.image_url || 'https://via.placeholder.com/300/374151/9CA3AF?text=Produit'}
                  alt={item.product.product_name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300/374151/9CA3AF?text=Produit';
                  }}
                />
                {item.product.nutriscore_grade && (
                  <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                    <NutriScore score={item.product.nutriscore_grade} />
                  </div>
                )}
                {item.quantity && item.quantity > 1 && (
                  <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 glass-icon px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">
                    <span className="text-xs font-semibold text-cyan-400">x{item.quantity}</span>
                  </div>
                )}
                {dlcStatus && (
                  <div className={`absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs font-semibold ${
                    dlcStatus.type === 'expired' 
                      ? 'bg-red-500/80 text-white' 
                      : dlcStatus.type === 'soon'
                      ? 'bg-yellow-500/80 text-white'
                      : 'bg-green-500/80 text-white'
                  }`}>
                    {dlcStatus.type === 'expired' 
                      ? `Expiré ${dlcStatus.days}j`
                      : dlcStatus.type === 'soon'
                      ? `${dlcStatus.days}j`
                      : 'OK'
                    }
                  </div>
                )}
                {item.category && (
                  <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 glass-icon px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs text-cyan-400 font-medium">
                    {item.category.split(' ')[0]}
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.id);
                  }}
                  className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 glass-error p-1 sm:p-1.5 rounded-lg hover:bg-red-500/30 transition-all"
                  aria-label="Retirer du frigo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-2 sm:p-3">
                <div className="text-xs text-cyan-400 font-semibold mb-0.5 sm:mb-1 truncate">
                  {item.product.brands || 'Marque inconnue'}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate mb-1">
                  {item.product.product_name}
                </h3>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">{new Date(item.addedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                    <span className="sm:hidden">{new Date(item.addedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' })}</span>
                  </div>
                  {item.dlc && (
                    <div className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      dlcStatus?.type === 'expired' 
                        ? 'bg-red-500/20 text-red-400' 
                        : dlcStatus?.type === 'soon'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      DLC: {new Date(item.dlc).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Frigo;

