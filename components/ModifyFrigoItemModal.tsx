import React, { useState } from 'react';
import { type Product } from '../types';
import { type FrigoCategory, type FrigoItem } from '../services/frigoService';

interface ModifyFrigoItemModalProps {
  item: FrigoItem;
  onClose: () => void;
  onConfirm: (quantity: number, category: FrigoCategory, dlc?: string) => void;
}

const categories: FrigoCategory[] = [
  'Fruits & Légumes',
  'Viandes & Poissons',
  'Produits Laitiers',
  'Épicerie',
  'Boissons',
  'Surgelés',
  'Boulangerie',
  'Autre'
];

const ModifyFrigoItemModal: React.FC<ModifyFrigoItemModalProps> = ({ item, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [category, setCategory] = useState<FrigoCategory>(item.category || 'Autre');
  const [dlc, setDlc] = useState(item.dlc || '');
  const [showDlc, setShowDlc] = useState(!!item.dlc);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(quantity, category, showDlc && dlc ? dlc : undefined);
  };

  // Détecter les changements
  React.useEffect(() => {
    const changed = 
      quantity !== (item.quantity || 1) ||
      category !== (item.category || 'Autre') ||
      (showDlc ? dlc : undefined) !== item.dlc;
    setHasChanges(changed);
  }, [quantity, category, dlc, showDlc, item]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 w-full max-w-md max-h-[90vh] overflow-y-auto smooth-scroll animate-bounce-in shadow-2xl border-2 border-cyan-400/20">
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
                Modifier la Fiche
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Ajustez les informations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 active:bg-white/5 transition-all touch-feedback min-w-[44px] min-h-[44px] flex-shrink-0"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 sm:mb-5 flex items-center gap-3 p-3 glass-input rounded-xl border-2 border-white/5">
          <img
            src={item.product.image_url || 'https://via.placeholder.com/60/374151/9CA3AF?text=?'}
            alt={item.product.product_name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border-2 border-white/20 shadow-md flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64/374151/9CA3AF?text=?';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-bold text-white truncate mb-0.5">{item.product.product_name}</p>
            <p className="text-xs text-gray-400 truncate">{item.product.brands || 'Marque inconnue'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Quantité
            </label>
            <div className="flex items-center gap-2.5 sm:gap-3 glass-input rounded-xl p-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center hover:bg-white/10 active:bg-white/5 transition-all touch-feedback disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                </svg>
              </button>
              <div className="flex-1 flex flex-col items-center justify-center">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-transparent text-center text-white font-bold text-2xl focus:outline-none"
                />
                <span className="text-xs text-gray-400">unité{quantity > 1 ? 's' : ''}</span>
              </div>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center hover:bg-white/10 active:bg-white/5 transition-all touch-feedback"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {/* Quick select */}
            <div className="flex gap-2 mt-2">
              {[1, 2, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuantity(num)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    quantity === num
                      ? 'glass-button text-white'
                      : 'glass-input text-gray-400 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Catégorie
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FrigoCategory)}
                className="w-full glass-input text-white py-3 px-4 pr-10 rounded-xl focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm appearance-none min-h-[48px]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-800 text-white">
                    {cat}
                  </option>
                ))}
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-300 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date Limite de Consommation
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowDlc(!showDlc);
                  if (showDlc) setDlc('');
                }}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                  showDlc 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'glass-input text-cyan-400 hover:bg-white/10'
                }`}
              >
                {showDlc ? '✕ Retirer' : '+ Ajouter'}
              </button>
            </div>
            {showDlc && (
              <div className="animate-slide-up">
                <input
                  type="date"
                  min={today}
                  value={dlc}
                  onChange={(e) => setDlc(e.target.value)}
                  className="w-full glass-input text-white py-3 px-4 rounded-xl focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm min-h-[48px]"
                />
              </div>
            )}
          </div>

          {/* Indicator de changements */}
          {hasChanges && (
            <div className="glass-input border-2 border-cyan-400/30 rounded-xl p-3 flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <p className="text-xs text-cyan-400 font-medium">Modifications non enregistrées</p>
            </div>
          )}

          <div className="flex gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass-input text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-white/10 active:bg-white/5 transition-all text-sm sm:text-base touch-feedback min-h-[52px] flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </button>
            <button
              type="submit"
              disabled={!hasChanges}
              className="flex-1 glass-button text-white font-semibold py-3.5 px-4 rounded-xl transition-all text-sm sm:text-base touch-feedback min-h-[52px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifyFrigoItemModal;

