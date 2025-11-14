
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { type Product } from '../types';
import { frigoService, type FrigoItem, type FrigoCategory, type PriceHistoryEntry } from '../services/frigoService';
import Loader from './Loader';
import FrigoStats from './FrigoStats';

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
interface PriceRange {
  min?: number;
  max?: number;
}
interface FiltersSidebarProps {
  isOpen: boolean;
  categories: string[];
  selectedCategory: FrigoCategory | 'Tous';
  onSelectCategory: (value: FrigoCategory | 'Tous') => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  dlcFilter: 'all' | 'expired' | 'soon' | 'ok';
  onDlcFilterChange: (value: 'all' | 'expired' | 'soon' | 'ok') => void;
  priceFilter: PriceRange;
  onPriceFilterChange: (value: PriceRange) => void;
  sortBy: SortOption;
  onSortByChange: (value: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  onResetFilters: () => void;
  onClose: () => void;
}
const subtleButtonClass =
  'inline-flex items-center gap-1.5 rounded-2xl border border-white/40 bg-white/70 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 transition hover:border-white/70 hover:text-[var(--accent)]';
const primaryButtonClass =
  'inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#0ea5e9] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)] hover:opacity-95';
const iconPillClass =
  'h-10 w-10 sm:h-11 sm:w-11 rounded-2xl border border-white/40 bg-white/80 text-slate-500 flex items-center justify-center transition hover:-translate-y-0.5 hover:text-[var(--accent)]';
const overlayChipClass =
  'px-2.5 py-1 rounded-xl border border-white/40 bg-white/90 text-[10px] font-semibold text-slate-600';

const Frigo: React.FC<FrigoProps> = ({ onProductSelect, onBack, onFrigoChange }) => {
  const [items, setItems] = useState<FrigoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<FrigoCategory | 'Tous'>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [dlcFilter, setDlcFilter] = useState<'all' | 'expired' | 'soon' | 'ok'>('all');
  const [priceFilter, setPriceFilter] = useState<PriceRange>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [dataMessage, setDataMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [shareMessage, setShareMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeSidebarIfMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setIsSidebarOpen(false);
    }
  };
  const handleCategorySelect = (value: FrigoCategory | 'Tous') => {
    setSelectedCategory(value);
    closeSidebarIfMobile();
  };

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
  const renderHiddenFileInput = () => (
    <input
      ref={fileInputRef}
      type="file"
      accept="application/json,.json"
      className="hidden"
      onChange={handleFileImport}
    />
  );

  const generateItemId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return (crypto as Crypto).randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  };

  const createProductKey = (item: FrigoItem) => {
    const brand = item.product.brands || 'no-brand';
    return `${item.product.product_name}|${brand}`.toLowerCase();
  };

  const mergeFrigoItems = (base: FrigoItem[], incoming: FrigoItem[]) => {
    const map = new Map<string, FrigoItem>();
    base.forEach(item => map.set(createProductKey(item), item));
    incoming.forEach(item => {
      const key = createProductKey(item);
      if (map.has(key)) {
        map.set(key, { ...map.get(key)!, ...item });
      } else {
        map.set(key, item);
      }
    });
    return Array.from(map.values());
  };

  const sanitizeProduct = (rawProduct: Partial<Product> | null | undefined): Product | null => {
    if (!rawProduct || typeof rawProduct !== 'object' || !rawProduct.product_name) {
      return null;
    }
    return {
      product_name: rawProduct.product_name,
      image_url: rawProduct.image_url || '',
      brands: rawProduct.brands || 'Marque inconnue',
      ingredients_text_with_allergens: rawProduct.ingredients_text_with_allergens || '',
      nutriments: rawProduct.nutriments || {},
      quantity: rawProduct.quantity || '',
      nutriscore_grade: rawProduct.nutriscore_grade || ''
    };
  };

  const normalizeImportedItems = (raw: unknown): FrigoItem[] => {
    if (!Array.isArray(raw)) return [];

    return raw
      .map((entry): FrigoItem | null => {
        if (!entry || typeof entry !== 'object') return null;
        const casted = entry as Partial<FrigoItem> & { product?: Partial<Product> };
        const product = sanitizeProduct(casted.product);
        if (!product) return null;

        const addedAt = casted.addedAt && !Number.isNaN(Date.parse(casted.addedAt))
          ? casted.addedAt
          : new Date().toISOString();
        const dlc = casted.dlc && !Number.isNaN(Date.parse(casted.dlc)) ? casted.dlc : undefined;

        const priceHistory = Array.isArray(casted.priceHistory)
          ? casted.priceHistory
              .map((historyEntry) => {
                if (!historyEntry || typeof historyEntry !== 'object') return null;
                const { price, store, date } = historyEntry as PriceHistoryEntry;
                if (typeof price !== 'number' || !store || !date || Number.isNaN(Date.parse(date))) {
                  return null;
                }
                return { price, store, date };
              })
              .filter(Boolean) as PriceHistoryEntry[]
          : undefined;

        const sanitizedItem: FrigoItem = {
          id: typeof casted.id === 'string' ? casted.id : generateItemId(),
          product,
          addedAt,
          quantity: typeof casted.quantity === 'number' && casted.quantity > 0 ? casted.quantity : 1,
          category: casted.category,
          dlc,
          price: typeof casted.price === 'number' ? casted.price : undefined,
          store: typeof casted.store === 'string' ? casted.store : undefined,
          priceHistory: priceHistory && priceHistory.length > 0 ? priceHistory : undefined
        };
        return sanitizedItem;
      })
      .filter((item): item is FrigoItem => item !== null);
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const buildCsvContent = (data: FrigoItem[]) => {
    const headers = [
      'Nom',
      'Marque',
      'Quantité',
      'Catégorie',
      'DLC',
      'Prix (EUR)',
      'Magasin',
      'Ajouté le',
      'NutriScore',
      'Commentaires'
    ];

    const rows = data.map(item => {
      const dlc = item.dlc ? new Date(item.dlc).toLocaleDateString('fr-FR') : '';
      const addedAt = new Date(item.addedAt).toLocaleDateString('fr-FR');
      return [
        item.product.product_name,
        item.product.brands,
        item.quantity ?? 1,
        item.category ?? '',
        dlc,
        item.price !== undefined ? item.price.toFixed(2) : '',
        item.store ?? '',
        addedAt,
        item.product.nutriscore_grade?.toUpperCase() ?? '',
        item.priceHistory && item.priceHistory.length > 0 ? 'Historique prix inclus' : ''
      ];
    });

    const allRows = [headers, ...rows];
    return allRows
      .map(row =>
        row
          .map(value => {
            const safe = value === null || value === undefined ? '' : String(value);
            return `"${safe.replace(/"/g, '""')}"`;
          })
          .join(';')
      )
      .join('\r\n');
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (items.length === 0) {
      setDataMessage({ type: 'error', text: 'Votre frigo est vide. Ajoutez des produits avant d’exporter.' });
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    if (format === 'json') {
      downloadFile(JSON.stringify(items, null, 2), `frigo-${timestamp}.json`, 'application/json');
    } else {
      downloadFile(buildCsvContent(items), `frigo-${timestamp}.csv`, 'text/csv;charset=utf-8;');
    }
    setDataMessage({ type: 'success', text: `Export ${format.toUpperCase()} prêt au téléchargement.` });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingImport(true);
    setDataMessage(null);

    try {
      const content = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch (error) {
        throw new Error('Le fichier sélectionné n’est pas un JSON valide.');
      }

      const normalized = normalizeImportedItems(parsed);
      if (normalized.length === 0) {
        throw new Error('Aucun produit exploitable n’a été trouvé dans ce fichier.');
      }

      let updatedItems = normalized;
      if (items.length > 0) {
        const shouldMerge = window.confirm(
          'Souhaitez-vous fusionner ces données avec votre frigo actuel ?\nOK = fusionner, Annuler = remplacer.'
        );
        updatedItems = shouldMerge ? mergeFrigoItems(items, normalized) : normalized;
      }

      const saved = frigoService.setAll(updatedItems);
      if (!saved) {
        throw new Error('Impossible d’enregistrer les nouveaux produits dans le frigo.');
      }

      setItems(updatedItems);
      setDataMessage({ type: 'success', text: `${normalized.length} produit(s) importé(s) avec succès.` });
      onFrigoChange?.();
    } catch (error) {
      console.error('Erreur import frigo', error);
      const message = error instanceof Error ? error.message : 'Import impossible. Réessayez avec un autre fichier.';
      setDataMessage({ type: 'error', text: message });
    } finally {
      setIsProcessingImport(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const getShoppingCandidates = () => {
    const candidates = items.filter(item => {
      const lowQuantity = !item.quantity || item.quantity <= 1;
      const dlcStatus = getDlcStatus(item);
      const riskyDlc = dlcStatus && (dlcStatus.type === 'expired' || dlcStatus.type === 'soon');
      return lowQuantity || riskyDlc;
    });
    return candidates.length > 0 ? candidates : items;
  };

  const buildShoppingListText = (list: FrigoItem[]) => {
    const header = `Liste de courses NutriScan (${new Date().toLocaleDateString('fr-FR')})`;
    const lines = list.map(item => {
      const qty = item.quantity ?? 1;
      const category = item.category ? ` – ${item.category}` : '';
      const dlc = item.dlc ? ` – DLC ${new Date(item.dlc).toLocaleDateString('fr-FR')}` : '';
      return `• ${item.product.product_name} (x${qty})${category}${dlc}`;
    });
    return [header, '', ...lines].join('\n');
  };

  const handleShareShoppingList = async () => {
    if (items.length === 0) {
      setShareMessage({ type: 'error', text: 'Ajoutez des produits avant de partager votre liste.' });
      return;
    }

    const candidates = getShoppingCandidates();
    const text = buildShoppingListText(candidates);

    try {
      if (typeof navigator !== 'undefined') {
        const nav = navigator as Navigator & {
          share?: (data?: ShareData) => Promise<void>;
        };
        if (nav.share) {
          await nav.share({
            title: 'Liste de courses NutriScan',
            text
          });
          setShareMessage({ type: 'success', text: 'Liste partagée via le menu de votre appareil.' });
          return;
        }
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          setShareMessage({ type: 'success', text: 'Liste copiée dans le presse-papiers.' });
          return;
        }
      }
    } catch (error) {
      console.error('Erreur partage liste', error);
      setShareMessage({
        type: 'error',
        text: 'Impossible de partager automatiquement. Un téléchargement va démarrer.'
      });
    }

    downloadFile(
      text,
      `liste-courses-${new Date().toISOString().split('T')[0]}.txt`,
      'text/plain;charset=utf-8;'
    );
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
      <div className="h-full overflow-y-auto bg-transparent px-4 py-6 text-slate-900 smooth-scroll safe-area-top safe-area-bottom sm:px-6">
        {renderHiddenFileInput()}
        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center animate-fade-in">
          <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-[32px] bg-white/80 shadow-[0_25px_60px_rgba(15,23,42,0.18)] sm:h-32 sm:w-32">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[var(--accent)] sm:h-20 sm:w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="mb-3 text-3xl font-semibold text-slate-900">Votre frigo est vide</h2>
          <p className="mb-8 max-w-md text-base text-slate-500">
            Scannez vos produits pour commencer à suivre vos stocks, vos prix et vos DLC en un clin d’œil.
          </p>
          <div className="flex w-full max-w-sm flex-col gap-3">
            <button
              onClick={onBack}
              className="glass-button flex items-center justify-center gap-3 rounded-2xl py-4 text-base font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Scanner un produit
            </button>
            <button
              onClick={handleImportClick}
              className="rounded-2xl border border-white/40 bg-white/80 px-6 py-4 text-base font-semibold text-slate-700 transition hover:bg-white"
              disabled={isProcessingImport}
            >
              {isProcessingImport ? 'Import en cours…' : 'Importer mes données'}
            </button>
            {dataMessage && (
              <p className={`text-sm ${dataMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {dataMessage.text}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-transparent px-3 py-4 text-slate-900 smooth-scroll safe-area-top safe-area-bottom sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl">
        {renderHiddenFileInput()}
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

        {/* Bouton flottant pour ouvrir la sidebar (mobile uniquement) */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-24 right-4 sm:hidden z-40 glass-button p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 touch-feedback"
          aria-label="Ouvrir les filtres"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>

        {/* Overlay pour fermer la sidebar (mobile uniquement) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 sm:hidden animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar avec recherche et filtres */}
        <FiltersSidebar
          isOpen={isSidebarOpen}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          dlcFilter={dlcFilter}
          onDlcFilterChange={(value) => setDlcFilter(value as typeof dlcFilter)}
          priceFilter={priceFilter}
          onPriceFilterChange={setPriceFilter}
          sortBy={sortBy}
          onSortByChange={(value) => setSortBy(value as SortOption)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={() => {
            setSearchQuery('');
            setSelectedCategory('Tous');
            setDlcFilter('all');
            setPriceFilter({});
          }}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* Header avec statistiques */}
          <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              {/* <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 flex items-center gap-2.5 sm:gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#60a5fa]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </span>
                <span className="truncate">Mon Frigo ({items.length} {items.length > 1 ? 'produits' : 'produit'})</span>
              </h2> */}
              <p className="mt-1 text-sm text-gray-400 hidden sm:block">Vue d’ensemble épurée de vos produits et actions rapides.</p>
            </div>
            {items.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className={`${iconPillClass} ${isSidebarOpen ? 'border-[#2563eb]/50 text-slate-900' : ''}`}
                  aria-label="Ouvrir les filtres"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 12h8m-5 6h2" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className={iconPillClass}
                  aria-label="Changer de vue"
                >
                  {viewMode === 'grid' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zm-10 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className={`${iconPillClass} ${showQuickActions ? 'border-[#2563eb]/50 text-slate-900' : ''}`}
                  aria-label={showQuickActions ? 'Masquer les actions rapides' : 'Afficher les actions rapides'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowStats(!showStats)}
                  className={`${iconPillClass} ${showStats ? 'border-[#2563eb]/50 text-slate-900' : ''}`}
                  aria-label={showStats ? "Masquer les statistiques" : "Afficher les statistiques"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2M5 21h14" />
                  </svg>
                </button>
                <button
                  onClick={handleClearAll}
                  className={`${subtleButtonClass} border-red-500/30 text-red-300 hover:border-red-400/60 hover:text-red-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Vider</span>
                </button>
              </div>
            )}
          </div>

          {/* Barre d’actions discrète */}
          {showQuickActions && (
            <div className="mb-4 sm:mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-3 sm:p-4 animate-fade-in">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-500">Actions rapides</p>
                  <span className="text-xs text-gray-500 hidden sm:inline">Export, import & partage</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleExport('json')} className={subtleButtonClass}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v11" />
                    </svg>
                    JSON
                  </button>
                  <button onClick={() => handleExport('csv')} className={subtleButtonClass}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 4h13M8 9h13M8 14h13M8 19h13M3 4h.01M3 9h.01M3 14h.01M3 19h.01" />
                    </svg>
                    CSV
                  </button>
                  <button
                    onClick={handleImportClick}
                    className={`${subtleButtonClass} ${isProcessingImport ? 'opacity-70 pointer-events-none' : ''}`}
                    disabled={isProcessingImport}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 8v6a4 4 0 01-4 4H8m8-10l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {isProcessingImport ? 'Import…' : 'Importer'}
                  </button>
                  <button onClick={handleShareShoppingList} className={primaryButtonClass}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4m0 0L8 6m4-4v14" />
                    </svg>
                    Partager
                  </button>
                </div>
                {(dataMessage || shareMessage) && (
                  <div className="text-xs text-gray-400">
                    {dataMessage && (
                      <p className={dataMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}>{dataMessage.text}</p>
                    )}
                    {shareMessage && (
                      <p className={shareMessage.type === 'success' ? 'text-[#60a5fa]' : 'text-red-400'}>{shareMessage.text}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

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
    </div>
  );

function FiltersSidebar({
  isOpen,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchQueryChange,
  dlcFilter,
  onDlcFilterChange,
  priceFilter,
  onPriceFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  onClose
}: FiltersSidebarProps) {
  const cardClass =
    'rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-sm sm:border-0 sm:bg-transparent sm:p-0';
  return (
    <aside
      className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[88vw] bg-white text-slate-700 shadow-[0_25px_45px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-in-out sm:relative sm:z-auto sm:h-auto sm:w-64 sm:translate-x-0 sm:bg-transparent sm:text-inherit sm:shadow-none sm:flex-shrink-0 ${
        isOpen ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'
      }`}
    >
      <div className="h-full overflow-y-auto space-y-5 px-4 pt-6 pb-28 smooth-scroll sm:space-y-4 sm:px-0 sm:pt-0 sm:pb-0">
        <div className="flex items-center justify-between sm:hidden">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Explorer</p>
            <h3 className="text-lg font-bold text-slate-900">Filtres & recherche</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200/70 px-2 py-1 text-slate-500 transition hover:text-[var(--accent)]"
            aria-label="Fermer les filtres"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={cardClass}>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Recherche</label>
          <div className="relative mt-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Nom, marque..."
              className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {searchQuery ? (
                <button onClick={() => onSearchQueryChange('')} aria-label="Effacer la recherche">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {categories.length > 0 && (
          <div className={cardClass}>
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Catégories</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => onSelectCategory('Tous')}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === 'Tous' ? 'bg-[var(--accent)] text-white shadow' : 'bg-slate-100 text-slate-600 hover:text-[var(--accent)]'
                }`}
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat as FrigoCategory)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === cat ? 'bg-[var(--accent)] text-white shadow' : 'bg-slate-100 text-slate-600 hover:text-[var(--accent)]'
                  }`}
                >
                  {cat.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={cardClass}>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Date de péremption</label>
          <select
            value={dlcFilter}
            onChange={(e) => onDlcFilterChange(e.target.value as FiltersSidebarProps['dlcFilter'])}
            className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="all">Toutes les DLC</option>
            <option value="expired">Expirés</option>
            <option value="soon">Expire bientôt</option>
            <option value="ok">OK</option>
          </select>
        </div>

        <div className={cardClass}>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Prix (€)</label>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5">
            <input
              type="number"
              placeholder="Min"
              value={priceFilter.min ?? ''}
              onChange={(e) => onPriceFilterChange({ ...priceFilter, min: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full bg-transparent text-sm focus:outline-none"
              min="0"
              step="0.01"
            />
            <span className="text-slate-300">—</span>
            <input
              type="number"
              placeholder="Max"
              value={priceFilter.max ?? ''}
              onChange={(e) => onPriceFilterChange({ ...priceFilter, max: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full bg-transparent text-sm focus:outline-none"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className={cardClass}>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Tri</label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortOption)}
            className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="date">Plus récent</option>
            <option value="name">Nom (A-Z)</option>
            <option value="price">Prix décroissant</option>
            <option value="dlc">DLC croissante</option>
          </select>
        </div>

        <div className={cardClass}>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Vue</label>
          <div className="mt-2 flex rounded-2xl border border-slate-200/80 bg-white p-1">
            {(['grid', 'list'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`flex-1 rounded-2xl px-2 py-1.5 text-sm font-semibold transition ${
                  viewMode === mode ? 'bg-[var(--accent)] text-white shadow' : 'text-slate-500'
                }`}
              >
                {mode === 'grid' ? 'Grille' : 'Liste'}
              </button>
            ))}
          </div>
        </div>

        {(searchQuery || selectedCategory !== 'Tous' || dlcFilter !== 'all' || priceFilter.min !== undefined || priceFilter.max !== undefined) && (
          <button
            onClick={() => {
              onResetFilters();
              onClose();
            }}
            className="w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-100 sm:hidden"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>
    </aside>
  );
}

  function renderProductCard(item: FrigoItem) {
    const dlcStatus = getDlcStatus(item);
    return (
      <div
        key={item.id}
        className="rounded-[28px] overflow-hidden border border-white/30 bg-white/85 shadow-[0_25px_55px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 cursor-pointer touch-feedback"
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
                  <div className={`${overlayChipClass} absolute top-1.5 sm:top-2 left-1.5 sm:left-2 text-[#60a5fa]`}>
                    x{item.quantity}
                  </div>
                )}
                {dlcStatus && (
                  <div className={`absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-lg ${
                    dlcStatus.type === 'expired' 
                      ? 'bg-red-500/70 text-slate-900' 
                      : dlcStatus.type === 'soon'
                      ? 'bg-yellow-500/70 text-slate-900'
                      : 'bg-green-500/70 text-slate-900'
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
                  <div className={`${overlayChipClass} absolute top-1.5 sm:top-2 left-1.5 sm:left-2 text-[#bfdbfe] font-medium`}>
                    {item.category.split(' ')[0]}
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.id);
                  }}
                  className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 rounded-lg border border-white/10 bg-black/30 p-1 sm:p-1.5 text-red-300 transition hover:border-red-400/50 hover:text-red-200"
                  aria-label="Retirer du frigo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-2 sm:p-3">
                <div className="text-xs text-[#2563eb] font-semibold mb-0.5 sm:mb-1 truncate">
                  {item.product.brands || 'Marque inconnue'}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate mb-1">
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
        className="rounded-[28px] overflow-hidden border border-white/30 bg-white/85 shadow-[0_25px_55px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 cursor-pointer touch-feedback"
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
              <div className={`${overlayChipClass} absolute top-2 left-2 text-[#60a5fa]`}>
                x{item.quantity}
              </div>
            )}
            {dlcStatus && (
              <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-lg text-xs font-semibold ${
                dlcStatus.type === 'expired' 
                  ? 'bg-red-500/80 text-slate-900' 
                  : dlcStatus.type === 'soon'
                  ? 'bg-yellow-500/80 text-slate-900'
                  : 'bg-green-500/80 text-slate-900'
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
                  <div className="text-xs text-[#2563eb] font-semibold mb-1 truncate">
                    {item.product.brands || 'Marque inconnue'}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                    {item.product.product_name}
                  </h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.id);
                  }}
                  className="rounded-lg border border-white/10 bg-black/30 p-2 text-red-300 transition hover:border-red-400/50 hover:text-red-100 flex-shrink-0"
                  aria-label="Retirer du frigo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Métadonnées */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {item.category && (
                  <div className={`${overlayChipClass} text-[#bfdbfe] font-medium`}>
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

