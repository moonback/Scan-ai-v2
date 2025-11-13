
import React, { useState, useEffect, useMemo } from 'react';
import { type Product } from '../types';
import { frigoService, type FrigoItem, type FrigoCategory } from '../services/frigoService';
import Loader from './Loader';
import FrigoStats from './FrigoStats';
import ImageScanner from './ImageScanner';
import ProductSelectionModal from './ProductSelectionModal';
import { type DetectedProduct } from '../services/visionService';

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

type SortOption = 'date' | 'name' | 'price' | 'dlc';
type ViewMode = 'grid' | 'list';

const Frigo: React.FC<FrigoProps> = ({ onProductSelect, onBack, onFrigoChange }) => {
  const [items, setItems] = useState<FrigoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<FrigoCategory | 'Tous'>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [dlcFilter, setDlcFilter] = useState<'all' | 'expired' | 'soon' | 'ok'>('all');
  const [priceFilter, setPriceFilter] = useState<{ min?: number; max?: number }>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showImageScanner, setShowImageScanner] = useState(false);
  const [imageScannerType, setImageScannerType] = useState<'receipt' | 'basket'>('receipt');
  const [detectedProducts, setDetectedProducts] = useState<DetectedProduct[]>([]);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [scanMetadata, setScanMetadata] = useState<{ store?: string; date?: string; totalAmount?: number } | undefined>();

  const getPriceVariation = (item: FrigoItem) => {
    if (!item.priceHistory || item.priceHistory.length < 2) return null;
    
    const latest = item.priceHistory[item.priceHistory.length - 1];
    const previous = item.priceHistory[item.priceHistory.length - 2];
    
    const diff = latest.price - previous.price;
    const percentage = ((diff / previous.price) * 100).toFixed(1);
    
    return { diff, percentage };
  };

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
    let filtered = items;

    // Filtre par catégorie
    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.product.product_name.toLowerCase().includes(query) ||
        item.product.brands.toLowerCase().includes(query) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.store && item.store.toLowerCase().includes(query))
      );
    }

    // Filtre par DLC
    if (dlcFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (!item.dlc) return false;
        const dlcStatus = getDlcStatus(item);
        if (!dlcStatus) return false;
        return dlcStatus.type === dlcFilter;
      });
    }

    // Filtre par prix
    if (priceFilter.min !== undefined || priceFilter.max !== undefined) {
      filtered = filtered.filter(item => {
        if (!item.price) return false;
        if (priceFilter.min !== undefined && item.price < priceFilter.min) return false;
        if (priceFilter.max !== undefined && item.price > priceFilter.max) return false;
        return true;
      });
    }

    // Tri
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.product.product_name.localeCompare(b.product.product_name);
        case 'price':
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return priceB - priceA; // Du plus cher au moins cher
        case 'dlc':
          if (!a.dlc && !b.dlc) return 0;
          if (!a.dlc) return 1;
          if (!b.dlc) return -1;
          return new Date(a.dlc).getTime() - new Date(b.dlc).getTime();
        case 'date':
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(); // Plus récent en premier
      }
    });

    return filtered;
  }, [items, selectedCategory, searchQuery, sortBy, dlcFilter, priceFilter]);

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
      <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-y-auto h-full smooth-scroll safe-area-top safe-area-bottom">
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-full text-center animate-fade-in">
          <div className="w-28 h-28 sm:w-32 sm:h-32 glass-icon rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-pulse-slow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 sm:h-20 sm:w-20 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Votre Frigo est Vide
          </h2>
          <p className="text-gray-400 mb-8 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Scannez des produits et ajoutez-les à votre frigo virtuel pour les retrouver facilement !
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <button
              onClick={onBack}
              className="glass-button text-white font-semibold py-4 sm:py-5 px-8 sm:px-10 rounded-xl sm:rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 text-base sm:text-lg touch-feedback min-h-[56px] shadow-xl flex-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Scanner un Produit
            </button>
            <button
              onClick={() => {
                setImageScannerType('receipt');
                setShowImageScanner(true);
              }}
              className="glass-input text-white font-semibold py-4 sm:py-5 px-8 sm:px-10 rounded-xl sm:rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 text-base sm:text-lg touch-feedback min-h-[56px] hover:bg-white/10 flex-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Scanner Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-y-auto h-full smooth-scroll safe-area-top safe-area-bottom">
      <div className="max-w-7xl mx-auto">
        {/* Alertes DLC */}
        {(expiredItems.length > 0 || expiringSoonItems.length > 0) && (
          <div className="mb-3 sm:mb-4 space-y-2">
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

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">

        {/* Boutons flottants (mobile uniquement) */}
        <div className="fixed bottom-24 right-4 sm:hidden z-40 flex flex-col gap-3">
          {/* Bouton scanner ticket */}
          <button
            onClick={() => {
              setImageScannerType('receipt');
              setShowImageScanner(true);
            }}
            className="glass-button p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 touch-feedback"
            aria-label="Scanner un ticket"
            title="Scanner un ticket de caisse"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          {/* Bouton scanner panier */}
          <button
            onClick={() => {
              setImageScannerType('basket');
              setShowImageScanner(true);
            }}
            className="glass-button p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 touch-feedback"
            aria-label="Scanner un panier"
            title="Scanner un panier"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          {/* Bouton filtres */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="glass-button p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 touch-feedback"
            aria-label="Ouvrir les filtres"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {/* Overlay pour fermer la sidebar (mobile uniquement) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 sm:hidden animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar avec recherche et filtres */}
        <div
          className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 transform transition-transform duration-300 ease-in-out sm:relative sm:transform-none sm:w-64 sm:h-auto sm:z-auto sm:bg-transparent sm:flex-shrink-0 ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'
          }`}
        >
          <div className="h-full overflow-y-auto p-4 sm:p-0 space-y-4 smooth-scroll">
            {/* Header sidebar mobile */}
            <div className="flex items-center justify-between mb-4 sm:hidden">
              <h3 className="text-lg font-bold text-white">Filtres & Recherche</h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Barre de recherche */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full glass-input text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm min-h-[44px]"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      aria-label="Effacer la recherche"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Filtres par catégorie */}
            {categories.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-2 block">Catégorie</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('Tous');
                      setIsSidebarOpen(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all touch-feedback min-h-[36px] ${
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
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsSidebarOpen(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all touch-feedback min-h-[36px] ${
                        selectedCategory === cat
                          ? 'glass-button text-white'
                          : 'glass-input text-gray-300 hover:text-white'
                      }`}
                    >
                      {cat.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filtre DLC */}
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Date de péremption</label>
              <div className="relative">
                <select
                  value={dlcFilter}
                  onChange={(e) => setDlcFilter(e.target.value as typeof dlcFilter)}
                  className="w-full glass-input text-white px-4 py-2.5 rounded-xl text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-cyan-400/50 transition-all min-h-[44px] pr-10"
                >
                  <option value="all">Toutes les DLC</option>
                  <option value="expired">Expirés</option>
                  <option value="soon">Expirent bientôt</option>
                  <option value="ok">OK</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filtre prix */}
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Prix (€)</label>
              <div className="flex items-center gap-2 glass-input px-3 py-2.5 rounded-xl min-h-[44px]">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceFilter.min || ''}
                  onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="flex-1 bg-transparent text-white text-sm placeholder-gray-400 focus:outline-none"
                  min="0"
                  step="0.01"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceFilter.max || ''}
                  onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="flex-1 bg-transparent text-white text-sm placeholder-gray-400 focus:outline-none"
                  min="0"
                  step="0.01"
                />
                {(priceFilter.min !== undefined || priceFilter.max !== undefined) && (
                  <button
                    onClick={() => setPriceFilter({})}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                    aria-label="Effacer filtre prix"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Tri */}
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Trier par</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full glass-input text-white px-4 py-2.5 rounded-xl text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-cyan-400/50 transition-all min-h-[44px] pr-10"
                >
                  <option value="date">Plus récent</option>
                  <option value="name">Nom (A-Z)</option>
                  <option value="price">Prix (↓)</option>
                  <option value="dlc">DLC (↑)</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Toggle vue grille/liste */}
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Vue</label>
              <div className="flex items-center gap-1 glass-input p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 p-2 rounded-lg transition-all text-sm font-medium ${
                    viewMode === 'grid'
                      ? 'glass-button text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-label="Vue grille"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>Grille</span>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 p-2 rounded-lg transition-all text-sm font-medium ${
                    viewMode === 'list'
                      ? 'glass-button text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-label="Vue liste"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span>Liste</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Bouton réinitialiser filtres (mobile) */}
            {(searchQuery || selectedCategory !== 'Tous' || dlcFilter !== 'all' || priceFilter.min !== undefined || priceFilter.max !== undefined) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Tous');
                  setDlcFilter('all');
                  setPriceFilter({});
                }}
                className="w-full glass-input text-red-400 hover:text-red-300 font-medium py-3 rounded-xl transition-all text-sm sm:hidden"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* Boutons d'ajout rapide (desktop) */}
        {items.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                setImageScannerType('receipt');
                setShowImageScanner(true);
              }}
              className="glass-input text-white font-medium py-2.5 px-4 rounded-xl transition-all hover:bg-white/10 text-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Scanner ticket
            </button>
            <button
              onClick={() => {
                setImageScannerType('basket');
                setShowImageScanner(true);
              }}
              className="glass-input text-white font-medium py-2.5 px-4 rounded-xl transition-all hover:bg-white/10 text-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Scanner panier
            </button>
          </div>
        )}

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* Header avec statistiques */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2.5 sm:gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="truncate">Mon Frigo ({items.length} {items.length > 1 ? 'produits' : 'produit'})</span>
              </h2>
            </div>
            {items.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className={`glass-input font-medium py-3 px-4 sm:px-5 rounded-xl transition-all duration-200 text-sm flex items-center gap-2 whitespace-nowrap touch-feedback min-h-[48px] ${
                    showStats 
                      ? 'text-cyan-400 bg-cyan-500/20' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                  aria-label={showStats ? "Masquer les statistiques" : "Afficher les statistiques"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="hidden sm:inline">Stats</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="glass-input text-red-400 hover:text-red-300 font-medium py-3 px-4 sm:px-5 rounded-xl transition-all duration-200 text-sm flex items-center gap-2 whitespace-nowrap touch-feedback min-h-[48px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Vider le frigo</span>
                  <span className="sm:hidden">Vider</span>
                </button>
              </div>
            )}
          </div>

          {/* Statistiques */}
          {showStats && items.length > 0 && (
            <div className="mb-4 sm:mb-6 animate-fade-in">
              <FrigoStats items={items} />
            </div>
          )}

          {/* Résultats */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-card p-6 rounded-2xl inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-400 font-medium">Aucun produit trouvé</p>
              <p className="text-gray-500 text-sm mt-1">Essayez de modifier vos filtres</p>
            </div>
          </div>
        ) : (
          <>
            {/* Vue grille */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                {filteredItems.map((item) => {
                  return renderProductCard(item);
                })}
              </div>
            )}

            {/* Vue liste */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  return renderProductListItem(item);
                })}
              </div>
            )}
          </>
        )}
        </div>
      </div>
      </div>

      {/* Image Scanner Modal */}
      {showImageScanner && (
        <ImageScanner
          type={imageScannerType}
          onProductsDetected={(products, metadata) => {
            setDetectedProducts(products);
            setScanMetadata(metadata);
            setShowImageScanner(false);
            setShowProductSelection(true);
          }}
          onClose={() => {
            setShowImageScanner(false);
          }}
        />
      )}

      {/* Product Selection Modal */}
      {showProductSelection && (
        <ProductSelectionModal
          detectedProducts={detectedProducts}
          metadata={scanMetadata}
          onConfirm={async (selectedProducts) => {
            let addedCount = 0;
            for (const { product, quantity, price } of selectedProducts) {
              // Essayer de trouver la catégorie depuis le nom du produit
              let category: FrigoCategory | undefined = undefined;
              const nameLower = product.product_name.toLowerCase();
              if (nameLower.includes('fruit') || nameLower.includes('légume') || nameLower.includes('vegetable')) {
                category = 'Fruits & Légumes';
              } else if (nameLower.includes('viande') || nameLower.includes('poisson') || nameLower.includes('meat') || nameLower.includes('fish')) {
                category = 'Viandes & Poissons';
              } else if (nameLower.includes('lait') || nameLower.includes('fromage') || nameLower.includes('yaourt') || nameLower.includes('dairy')) {
                category = 'Produits Laitiers';
              } else if (nameLower.includes('boisson') || nameLower.includes('drink') || nameLower.includes('eau')) {
                category = 'Boissons';
              } else if (nameLower.includes('surgelé') || nameLower.includes('frozen')) {
                category = 'Surgelés';
              } else if (nameLower.includes('pain') || nameLower.includes('boulang') || nameLower.includes('bread')) {
                category = 'Boulangerie';
              }

              const success = frigoService.add(
                product,
                quantity,
                category,
                undefined, // DLC
                price,
                scanMetadata?.store
              );
              if (success) addedCount++;
            }
            
            if (addedCount > 0) {
              loadFrigo();
              onFrigoChange?.();
              alert(`${addedCount} produit${addedCount > 1 ? 's' : ''} ajouté${addedCount > 1 ? 's' : ''} au frigo !`);
            }
            
            setShowProductSelection(false);
            setDetectedProducts([]);
            setScanMetadata(undefined);
          }}
          onClose={() => {
            setShowProductSelection(false);
            setDetectedProducts([]);
            setScanMetadata(undefined);
          }}
        />
      )}
    </div>
  );

  function renderProductCard(item: FrigoItem) {
    const dlcStatus = getDlcStatus(item);
    return (
      <div
        key={item.id}
        className="glass-product rounded-2xl sm:rounded-3xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer touch-feedback shadow-lg"
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
                
                {/* Prix et Magasin */}
                {(item.price || item.store) && (
                  <div className="mb-1.5 space-y-0.5">
                    {item.price && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{item.price.toFixed(2)} €</span>
                        </div>
                        {(() => {
                          const variation = getPriceVariation(item);
                          if (!variation) return null;
                          return (
                            <div className={`
                              flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-bold
                              ${variation.diff > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}
                            `}>
                              {variation.diff > 0 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                              )}
                              <span>{variation.percentage}%</span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {item.store && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 truncate">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="truncate">{item.store}</span>
                      </div>
                    )}
                  </div>
                )}
                
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
  }

  function renderProductListItem(item: FrigoItem) {
    const dlcStatus = getDlcStatus(item);
    return (
      <div
        key={item.id}
        className="glass-product rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer touch-feedback shadow-lg"
        onClick={() => onProductSelect(item.product)}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-32 h-40 sm:h-32 flex-shrink-0">
            <img
              className="w-full h-full object-cover"
              src={item.product.image_url || 'https://via.placeholder.com/300/374151/9CA3AF?text=Produit'}
              alt={item.product.product_name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300/374151/9CA3AF?text=Produit';
              }}
            />
            {item.product.nutriscore_grade && (
              <div className="absolute top-2 right-2">
                <NutriScore score={item.product.nutriscore_grade} />
              </div>
            )}
            {item.quantity && item.quantity > 1 && (
              <div className="absolute top-2 left-2 glass-icon px-2 py-1 rounded-lg">
                <span className="text-xs font-semibold text-cyan-400">x{item.quantity}</span>
              </div>
            )}
            {dlcStatus && (
              <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-lg text-xs font-semibold ${
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
          </div>

          {/* Contenu */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-cyan-400 font-semibold mb-1 truncate">
                    {item.product.brands || 'Marque inconnue'}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 line-clamp-2">
                    {item.product.product_name}
                  </h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.id);
                  }}
                  className="glass-error p-2 rounded-lg hover:bg-red-500/30 transition-all flex-shrink-0"
                  aria-label="Retirer du frigo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Métadonnées */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {item.category && (
                  <div className="glass-icon px-2 py-1 rounded-lg text-xs text-cyan-400 font-medium">
                    {item.category}
                  </div>
                )}
                {item.price && (
                  <div className="flex items-center gap-1 text-sm text-green-400 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{item.price.toFixed(2)} €</span>
                  </div>
                )}
                {item.store && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{item.store}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Ajouté {new Date(item.addedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              {item.dlc && (
                <div className={`text-xs font-medium px-2 py-1 rounded ${
                  dlcStatus?.type === 'expired' 
                    ? 'bg-red-500/20 text-red-400' 
                    : dlcStatus?.type === 'soon'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  DLC: {new Date(item.dlc).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Frigo;

