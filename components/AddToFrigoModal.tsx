
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Ajouter au Frigo
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3 p-3 glass-input rounded-lg">
          <img
            src={product.image_url || 'https://via.placeholder.com/60/374151/9CA3AF?text=?'}
            alt={product.product_name}
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60/374151/9CA3AF?text=?';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{product.product_name}</p>
            <p className="text-xs text-gray-400 truncate">{product.brands || 'Marque inconnue'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantité
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="glass-input w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 glass-input text-center text-white font-semibold py-2 rounded-lg focus:ring-2 focus:ring-cyan-400/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="glass-input w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FrigoCategory)}
              className="w-full glass-input text-white py-2.5 px-3 rounded-lg focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-800">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Date Limite de Consommation (DLC)
              </label>
              <button
                type="button"
                onClick={() => setShowDlc(!showDlc)}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
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
                className="w-full glass-input text-white py-2.5 px-3 rounded-lg focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm"
              />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass-input text-white font-medium py-2.5 px-4 rounded-lg hover:bg-white/10 transition-all text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 glass-button text-white font-semibold py-2.5 px-4 rounded-lg transition-all text-sm"
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

