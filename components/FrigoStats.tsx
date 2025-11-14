import React, { useMemo } from 'react';
import { type FrigoItem } from '../services/frigoService';

interface FrigoStatsProps {
  items: FrigoItem[];
}

const FrigoStats: React.FC<FrigoStatsProps> = ({ items }) => {
  // Calcul du coût total
  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  }, [items]);

  // Produits expirés
  const expiredItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return items.filter(item => {
      if (!item.dlc) return false;
      const dlcDate = new Date(item.dlc);
      dlcDate.setHours(0, 0, 0, 0);
      return dlcDate < today;
    });
  }, [items]);

  // Taux de gaspillage
  const wasteRate = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.round((expiredItems.length / items.length) * 100);
  }, [items.length, expiredItems.length]);

  // Coût des produits expirés
  const expiredCost = useMemo(() => {
    return expiredItems.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  }, [expiredItems]);

  // Produits les plus consommés (par quantité totale)
  const mostConsumed = useMemo(() => {
    const productMap = new Map<string, { name: string; totalQuantity: number; count: number }>();
    
    items.forEach(item => {
      const key = `${item.product.product_name}_${item.product.brands}`;
      const existing = productMap.get(key);
      const quantity = item.quantity || 1;
      
      if (existing) {
        existing.totalQuantity += quantity;
        existing.count += 1;
      } else {
        productMap.set(key, {
          name: item.product.product_name,
          totalQuantity: quantity,
          count: 1
        });
      }
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);
  }, [items]);

  // Graphique de consommation (7 derniers jours)
  const consumptionChart = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    return last7Days.map(date => {
      const added = items.filter(item => {
        const addedDate = new Date(item.addedAt);
        addedDate.setHours(0, 0, 0, 0);
        return addedDate.getTime() === date.getTime();
      }).length;

      // Pour les supprimés, on ne peut pas vraiment tracker, donc on utilise une estimation
      // basée sur les produits expirés ce jour-là
      const removed = items.filter(item => {
        if (!item.dlc) return false;
        const dlcDate = new Date(item.dlc);
        dlcDate.setHours(0, 0, 0, 0);
        return dlcDate.getTime() === date.getTime();
      }).length;

      return {
        date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        added,
        removed
      };
    });
  }, [items]);

  const maxValue = Math.max(...consumptionChart.map(d => Math.max(d.added, d.removed)), 1);

  return (
    <div className="space-y-4">
      {/* Coût total et statistiques principales */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-400 font-medium">Coût total</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{totalCost.toFixed(2)} €</p>
          {expiredCost > 0 && (
            <p className="text-xs text-red-400 mt-1">Dont {expiredCost.toFixed(2)} € expirés</p>
          )}
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-xs text-gray-400 font-medium">Gaspillage</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{wasteRate}%</p>
          <p className="text-xs text-gray-400 mt-1">{expiredItems.length} produit{expiredItems.length > 1 ? 's' : ''} expiré{expiredItems.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Graphique de consommation */}
      <div className="glass-card p-4 rounded-xl">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#d4ff4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Consommation (7 jours)
        </h3>
        <div className="flex items-end justify-between gap-1 h-32">
          {consumptionChart.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center justify-end gap-0.5 h-24">
                {/* Barre ajoutés */}
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-300"
                  style={{ height: `${(day.added / maxValue) * 100}%` }}
                  title={`${day.added} ajouté${day.added > 1 ? 's' : ''}`}
                />
                {/* Barre supprimés */}
                {day.removed > 0 && (
                  <div
                    className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t transition-all duration-300"
                    style={{ height: `${(day.removed / maxValue) * 100}%` }}
                    title={`${day.removed} expiré${day.removed > 1 ? 's' : ''}`}
                  />
                )}
              </div>
              <span className="text-[10px] text-gray-400 font-medium mt-1">{day.date}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-xs text-gray-400">Ajoutés</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-xs text-gray-400">Expirés</span>
          </div>
        </div>
      </div>

      {/* Produits les plus consommés */}
      {mostConsumed.length > 0 && (
        <div className="glass-card p-4 rounded-xl">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#d4ff4c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Produits les plus consommés
          </h3>
          <div className="space-y-2">
            {mostConsumed.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#d4ff4c] via-[#68ff9a] to-[#32d2a1] flex items-center justify-center text-slate-900 text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-sm text-slate-900 truncate">{product.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">{product.count}x</span>
                  <span className="text-sm font-semibold text-[#d4ff4c]">{product.totalQuantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FrigoStats;

