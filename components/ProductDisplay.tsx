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
    <div className="h-full overflow-y-auto bg-transparent px-3 py-4 smooth-scroll safe-area-top safe-area-bottom sm:px-6 md:px-8">
      <div className="mx-auto flex w-full max-w-8xl flex-col gap-4 pb-24 sm:gap-5 sm:pb-28">
        <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr] sm:gap-5">
          <div className="glass-product relative h-[260px] overflow-hidden rounded-[26px] shadow-[0_30px_70px_rgba(15,23,42,0.2)] sm:h-[320px] sm:rounded-[32px]">
            <img
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              src={product.image_url || 'https://picsum.photos/600/400'}
              alt={product.product_name}
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400/edf2ff/94a3b8?text=Image+indisponible';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">{product.brands || 'Marque inconnue'}</p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight">{product.product_name}</h2>
              {product.quantity && (
                <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {product.quantity}
                </p>
              )}
            </div>
            {product.nutriscore_grade && (
              <div className="absolute left-5 top-5 animate-bounce-in">
                <NutriScore score={product.nutriscore_grade} />
              </div>
            )}
          </div>

          <div className="glass-card flex flex-col gap-4 rounded-[26px] p-4 sm:rounded-[32px] sm:p-6">
            <div className="flex flex-wrap gap-2">
              <span className="stat-chip rounded-full px-3 py-1 text-xs font-semibold text-slate-500">
                {product.brands || 'Marque inconnue'}
              </span>
              {product.quantity && (
                <span className="stat-chip rounded-full px-3 py-1 text-xs font-semibold text-slate-500">
                  {product.quantity}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">Suivez les informations nutritionnelles, les stocks et les prix pour ce produit.</p>

            {frigoItem ? (
              <div className="rounded-2xl border border-[var(--accent-soft)] bg-white/80 p-4 shadow-inner">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-dark)]">Dans votre frigo</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {frigoItem.quantity ?? 1} unité{frigoItem.quantity && frigoItem.quantity > 1 ? 's' : ''}
                    </p>
                  </div>
                  {hasHistory && (
                    <button
                      onClick={() => setShowPriceHistory(true)}
                      className="rounded-xl border border-white/40 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition hover:bg-white"
                    >
                      Historique
                    </button>
                  )}
                </div>
                {frigoItem.price && (
                  <div className="mt-3 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#ecf2ff] to-[#fdf2f8] px-3 py-2">
                    <div className="flex items-center gap-1 text-base font-bold text-slate-900">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {frigoItem.price.toFixed(2)} €
                    </div>
                    {variation && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          variation.diff > 0 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {variation.diff > 0 ? '+' : ''}
                        {variation.percentage}%
                      </span>
                    )}
                  </div>
                )}
                {frigoItem.store && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {frigoItem.store}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-500">
                Ajoutez ce produit à votre frigo pour suivre automatiquement les prix, stocks et notifications DLC.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 sm:gap-5">
          <div className="glass-card rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Valeurs nutritionnelles
              </h3>
              <button
                onClick={() => setShowNutriments(!showNutriments)}
                className="rounded-full border border-white/40 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-white/70 hover:text-[var(--accent)]"
              >
                {showNutriments ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {showNutriments && product.nutriments && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {mainNutriments.map((nutriment) => {
                  const value = product.nutriments[nutriment.key];
                  if (value === undefined || value === null) return null;
                  return (
                    <div key={nutriment.key} className="rounded-2xl border border-white/40 bg-white/80 px-4 py-3 shadow-sm">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        <span>{nutriment.icon}</span>
                        {nutriment.label}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {typeof value === 'number' ? value.toFixed(1) : value} {nutriment.unit}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
            {!showNutriments && (
              <p className="mt-3 text-sm text-slate-500">Déployez la section pour visualiser les principaux nutriments pour 100g / 100ml.</p>
            )}
          </div>

          <div className="glass-card rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ingrédients
            </h3>
            <div className="mt-3 max-h-48 overflow-y-auto rounded-2xl border border-white/40 bg-white/80 p-4 text-sm text-slate-600 smooth-scroll">
              {product.ingredients_text_with_allergens || 'Aucune information sur les ingrédients disponible.'}
            </div>
          </div>
        </section>

        <section className="glass-card rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
          <div className="grid gap-2 md:grid-cols-3 sm:gap-3">
            {onAddToFrigo && (
              <button
                onClick={onAddToFrigo}
                className="glass-button flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Ajouter au frigo
              </button>
            )}
            <button
              onClick={onStartChat}
              className="glass-button flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] py-3 text-sm font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
              </svg>
              Question à l'IA
            </button>
            <button
              onClick={onScanAnother}
              className="rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white"
            >
              Scanner un autre produit
            </button>
          </div>
        </section>
      </div>
    </div>
    </>
  );
};

export default ProductDisplay;
