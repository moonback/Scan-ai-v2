import React, { useState, useEffect } from 'react';
import { type DetectedProduct } from '../services/visionService';
import { fetchProductByBarcode } from '../services/openFoodFactsService';
import { type Product } from '../types';
import Loader from './Loader';

interface ProductSelectionModalProps {
  detectedProducts: DetectedProduct[];
  metadata?: { store?: string; date?: string; totalAmount?: number };
  onConfirm: (selectedProducts: Array<{ product: Product; quantity: number; price?: number }>) => void;
  onClose: () => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  detectedProducts,
  metadata,
  onConfirm,
  onClose
}) => {
  const [selectedProducts, setSelectedProducts] = useState<Map<number, { product: Product | null; quantity: number; price?: number; isLoading: boolean; error?: string }>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initialiser la sélection avec tous les produits
    const initial = new Map();
    detectedProducts.forEach((detected, index) => {
      initial.set(index, {
        product: null,
        quantity: detected.quantity || 1,
        price: detected.price,
        isLoading: false,
        error: undefined
      });
    });
    setSelectedProducts(initial);
    
    // Essayer de récupérer les produits depuis OpenFoodFacts
    detectedProducts.forEach(async (detected, index) => {
      if (detected.barcode) {
        initial.set(index, { ...initial.get(index)!, isLoading: true });
        setSelectedProducts(new Map(initial));
        
        try {
          const product = await fetchProductByBarcode(detected.barcode);
          initial.set(index, { ...initial.get(index)!, product, isLoading: false });
          setSelectedProducts(new Map(initial));
        } catch (err) {
          // Si le code-barres n'est pas trouvé, on garde juste le nom
          initial.set(index, { 
            ...initial.get(index)!, 
            isLoading: false, 
            error: 'Produit non trouvé dans OpenFoodFacts'
          });
          setSelectedProducts(new Map(initial));
        }
      }
    });
  }, [detectedProducts]);

  const toggleProduct = (index: number) => {
    const newMap = new Map(selectedProducts);
    const current = newMap.get(index);
    if (current) {
      newMap.set(index, { ...current, quantity: current.quantity > 0 ? 0 : (detectedProducts[index].quantity || 1) });
      setSelectedProducts(newMap);
    }
  };

  const updateQuantity = (index: number, quantity: number) => {
    const newMap = new Map(selectedProducts);
    const current = newMap.get(index);
    if (current) {
      newMap.set(index, { ...current, quantity: Math.max(0, quantity) });
      setSelectedProducts(newMap);
    }
  };

  const handleConfirm = () => {
    const toAdd: Array<{ product: Product; quantity: number; price?: number }> = [];
    
    selectedProducts.forEach((value, index) => {
      if (value.quantity > 0) {
        // Si on a un produit OpenFoodFacts, l'utiliser
        if (value.product) {
          toAdd.push({
            product: value.product,
            quantity: value.quantity,
            price: value.price
          });
        } else {
          // Sinon, créer un produit minimal depuis les données détectées
          const detected = detectedProducts[index];
          const minimalProduct: Product = {
            product_name: detected.name,
            image_url: '',
            brands: detected.brand || '',
            ingredients_text_with_allergens: '',
            nutriments: {},
            quantity: '',
            nutriscore_grade: ''
          };
          toAdd.push({
            product: minimalProduct,
            quantity: value.quantity,
            price: value.price
          });
        }
      }
    });

    if (toAdd.length > 0) {
      onConfirm(toAdd);
    } else {
      alert('Veuillez sélectionner au moins un produit.');
    }
  };

  const selectedCount = Array.from(selectedProducts.values()).filter(v => v.quantity > 0).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="glass-header p-4 sm:p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Produits détectés
              </h2>
              {metadata && (
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-400">
                  {metadata.store && (
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {metadata.store}
                    </span>
                  )}
                  {metadata.date && (
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {metadata.date}
                    </span>
                  )}
                  {metadata.totalAmount && (
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {metadata.totalAmount.toFixed(2)} €
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 smooth-scroll">
          {detectedProducts.map((detected, index) => {
            const selected = selectedProducts.get(index);
            if (!selected) return null;

            return (
              <div
                key={index}
                className={`glass-product p-4 rounded-xl transition-all ${
                  selected.quantity > 0 ? 'ring-2 ring-cyan-400/50' : 'opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.quantity > 0}
                    onChange={() => toggleProduct(index)}
                    className="mt-1 w-5 h-5 rounded border-gray-400 text-cyan-400 focus:ring-cyan-400"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate">{detected.name}</h3>
                        {detected.brand && (
                          <p className="text-sm text-gray-400 truncate">{detected.brand}</p>
                        )}
                      </div>
                      {selected.isLoading && (
                        <Loader />
                      )}
                      {selected.error && (
                        <span className="text-xs text-yellow-400">⚠️ Non trouvé</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-400">Quantité:</label>
                        <input
                          type="number"
                          min="1"
                          value={selected.quantity}
                          onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                          className="w-16 glass-input text-white text-sm px-2 py-1 rounded-lg text-center"
                          disabled={selected.quantity === 0}
                        />
                      </div>
                      {selected.price !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-green-400 font-semibold">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{selected.price.toFixed(2)} €</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="glass-header p-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">
              {selectedCount} produit{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 glass-input text-white font-semibold py-3 px-6 rounded-xl transition-all touch-feedback min-h-[48px]"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedCount === 0 || isProcessing}
              className="flex-1 glass-button text-white font-semibold py-3 px-6 rounded-xl transition-all touch-feedback min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter au frigo ({selectedCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;

