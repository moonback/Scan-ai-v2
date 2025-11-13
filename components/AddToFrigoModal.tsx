
import React, { useState } from 'react';
import { type Product } from '../types';
import { type FrigoCategory } from '../services/frigoService';

interface AddToFrigoModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (quantity: number, category: FrigoCategory, dlc?: string) => void;
}

const CATEGORIES: FrigoCategory[] = [
  'Fruits & Légumes',
  'Viandes & Poissons',
  'Produits Laitiers',
  'Épicerie',
  'Boissons',
  'Surgelés',
  'Boulangerie',
  'Autre'
];

const AddToFrigoModal: React.FC<AddToFrigoModalProps> = ({ product, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState<FrigoCategory>('Autre');
  const [dlc, setDlc] = useState('');
  const [showDlc, setShowDlc] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(quantity, category, showDlc && dlc ? dlc : undefined);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto smooth-scroll animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Ajouter au Frigo
          </h3>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-white/10 active:bg-white/5 transition-all touch-feedback min-w-[44px] min-h-[44px]"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-5 sm:mb-6 flex items-center gap-3 sm:gap-4 p-4 glass-input rounded-xl">
          <img
            src={product.image_url || 'https://via.placeholder.com/60/374151/9CA3AF?text=?'}
            alt={product.product_name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white/10 shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80/374151/9CA3AF?text=?';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-base sm:text-lg font-semibold text-white truncate mb-1">{product.product_name}</p>
            <p className="text-sm text-gray-400 truncate">{product.brands || 'Marque inconnue'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-300 mb-3">
              Quantité
            </label>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="glass-input w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center hover:bg-white/10 active:bg-white/5 transition-all touch-feedback"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 glass-input text-center text-white font-bold py-3 sm:py-4 rounded-xl text-lg sm:text-xl focus:ring-2 focus:ring-cyan-400/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="glass-input w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center hover:bg-white/10 active:bg-white/5 transition-all touch-feedback"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-300 mb-3">
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FrigoCategory)}
              className="w-full glass-input text-white py-3 sm:py-4 px-4 rounded-xl focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm sm:text-base min-h-[48px]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-800">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm sm:text-base font-semibold text-gray-300">
                Date Limite de Consommation (DLC)
              </label>
              <button
                type="button"
                onClick={() => setShowDlc(!showDlc)}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors touch-feedback px-2 py-1 rounded-lg"
              >
                {showDlc ? 'Masquer' : 'Ajouter'}
              </button>
            </div>
            {showDlc && (
              <input
                type="date"
                min={today}
                value={dlc}
                onChange={(e) => setDlc(e.target.value)}
                className="w-full glass-input text-white py-3 sm:py-4 px-4 rounded-xl focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm sm:text-base min-h-[48px]"
              />
            )}
          </div>

          <div className="flex gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass-input text-white font-semibold py-4 px-6 rounded-xl sm:rounded-2xl hover:bg-white/10 active:bg-white/5 transition-all text-base sm:text-lg touch-feedback min-h-[56px]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 glass-button text-white font-semibold py-4 px-6 rounded-xl sm:rounded-2xl transition-all text-base sm:text-lg touch-feedback min-h-[56px]"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToFrigoModal;

