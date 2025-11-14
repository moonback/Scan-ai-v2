import React from 'react';
import { type FrigoItem, type PriceHistoryEntry } from '../services/frigoService';

interface PriceHistoryModalProps {
  item: FrigoItem;
  onClose: () => void;
}

const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({ item, onClose }) => {
  const history = item.priceHistory || [];
  
  // Ajouter le prix actuel à l'affichage si disponible
  const allEntries = [...history];
  if (item.price !== undefined && item.store !== undefined) {
    // Vérifier si le prix actuel est déjà dans l'historique
    const lastEntry = history[history.length - 1];
    const isCurrentInHistory = lastEntry && 
      lastEntry.price === item.price && 
      lastEntry.store === item.store;
    
    if (!isCurrentInHistory) {
      allEntries.push({
        price: item.price,
        store: item.store,
        date: new Date().toISOString()
      });
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const calculateDifference = (current: number, previous: number) => {
    const diff = current - previous;
    const percentage = ((diff / previous) * 100).toFixed(1);
    return { diff, percentage };
  };

  const getLowestPrice = () => {
    if (allEntries.length === 0) return null;
    return allEntries.reduce((min, entry) => 
      entry.price < min.price ? entry : min
    );
  };

  const getHighestPrice = () => {
    if (allEntries.length === 0) return null;
    return allEntries.reduce((max, entry) => 
      entry.price > max.price ? entry : max
    );
  };

  const getAveragePrice = () => {
    if (allEntries.length === 0) return 0;
    const sum = allEntries.reduce((acc, entry) => acc + entry.price, 0);
    return sum / allEntries.length;
  };

  const lowestPrice = getLowestPrice();
  const highestPrice = getHighestPrice();
  const averagePrice = getAveragePrice();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto smooth-scroll animate-bounce-in shadow-2xl border-2 border-[#2563eb]/20">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563eb] via-[#38bdf8] to-[#0ea5e9] flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Historique des Prix
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Comparez vos achats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-50 transition-all touch-feedback min-w-[44px] min-h-[44px] flex-shrink-0"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-slate-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Info */}
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
            <p className="text-sm sm:text-base font-bold text-slate-900 truncate mb-0.5">{item.product.product_name}</p>
            <p className="text-xs text-gray-400 truncate">{item.product.brands || 'Marque inconnue'}</p>
          </div>
        </div>

        {allEntries.length === 0 ? (
          <div className="glass-input rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Aucun historique de prix disponible</p>
            <p className="text-gray-500 text-xs mt-1">Les modifications futures seront enregistrées ici</p>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
              <div className="glass-input rounded-xl p-3 text-center border-2 border-green-500/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-xs text-gray-400">Min</span>
                </div>
                <p className="text-lg font-bold text-green-400">
                  {lowestPrice ? `${lowestPrice.price.toFixed(2)} €` : '-'}
                </p>
                {lowestPrice && (
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{lowestPrice.store}</p>
                )}
              </div>

              <div className="glass-input rounded-xl p-3 text-center border-2 border-[#2563eb]/25">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  <span className="text-xs text-gray-400">Moy</span>
                </div>
                <p className="text-lg font-bold text-[#2563eb]">
                  {averagePrice.toFixed(2)} €
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">{allEntries.length} achats</p>
              </div>

              <div className="glass-input rounded-xl p-3 text-center border-2 border-red-500/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-xs text-gray-400">Max</span>
                </div>
                <p className="text-lg font-bold text-red-400">
                  {highestPrice ? `${highestPrice.price.toFixed(2)} €` : '-'}
                </p>
                {highestPrice && (
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{highestPrice.store}</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Historique des Achats
              </h4>
              
              <div className="space-y-2">
                {allEntries.map((entry, index) => {
                  const isLatest = index === allEntries.length - 1;
                  const previousEntry = index > 0 ? allEntries[index - 1] : null;
                  const diff = previousEntry ? calculateDifference(entry.price, previousEntry.price) : null;
                  const isLowest = lowestPrice && entry.price === lowestPrice.price && entry.store === lowestPrice.store;
                  const isHighest = highestPrice && entry.price === highestPrice.price && entry.store === highestPrice.store;
                  
                  return (
                    <div 
                      key={index}
                      className={`
                        glass-input rounded-xl p-3 border-2 transition-all animate-fade-in
                        ${isLatest ? 'border-[#2563eb]/40 bg-[#2563eb]/10' : 'border-white/5'}
                        ${isLowest ? 'border-green-500/30 bg-green-500/5' : ''}
                        ${isHighest ? 'border-red-500/30 bg-red-500/5' : ''}
                      `}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-lg font-bold text-slate-900">
                              {entry.price.toFixed(2)} €
                            </p>
                            {isLatest && (
                              <span className="px-2 py-0.5 bg-[#2563eb]/15 text-[#2563eb] text-[10px] font-bold rounded-full">
                                ACTUEL
                              </span>
                            )}
                            {isLowest && !isLatest && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full">
                                MEILLEUR
                              </span>
                            )}
                            {isHighest && !isLatest && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full">
                                CHER
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="truncate">{entry.store}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(entry.date)}</span>
                          </div>
                        </div>
                        
                        {diff && (
                          <div className={`
                            flex flex-col items-end justify-center px-2 py-1 rounded-lg
                            ${diff.diff > 0 ? 'bg-red-500/10' : diff.diff < 0 ? 'bg-green-500/10' : 'bg-gray-500/10'}
                          `}>
                            <div className={`
                              flex items-center gap-1 text-xs font-bold
                              ${diff.diff > 0 ? 'text-red-400' : diff.diff < 0 ? 'text-green-400' : 'text-gray-400'}
                            `}>
                              {diff.diff > 0 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                              ) : diff.diff < 0 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                              ) : (
                                <span>=</span>
                              )}
                              <span>{diff.diff > 0 ? '+' : ''}{diff.diff.toFixed(2)} €</span>
                            </div>
                            <span className={`
                              text-[10px]
                              ${diff.diff > 0 ? 'text-red-400/70' : diff.diff < 0 ? 'text-green-400/70' : 'text-gray-400/70'}
                            `}>
                              {diff.diff > 0 ? '+' : ''}{diff.percentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full glass-button text-white font-semibold py-3.5 px-4 rounded-xl transition-all touch-feedback min-h-[52px] flex items-center justify-center gap-2 shadow-lg hover:shadow-[rgba(104,255,154,0.35)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryModal;

