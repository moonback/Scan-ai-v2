
import { type Product } from '../types';

export type FrigoExportFormat = 'json' | 'csv';

export interface FrigoImportResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
}

export type FrigoCategory = 
  | 'Fruits & Légumes'
  | 'Viandes & Poissons'
  | 'Produits Laitiers'
  | 'Épicerie'
  | 'Boissons'
  | 'Surgelés'
  | 'Boulangerie'
  | 'Autre';

export interface PriceHistoryEntry {
  price: number;
  store: string;
  date: string;
}

export interface FrigoItem {
  id: string;
  product: Product;
  addedAt: string;
  quantity?: number;
  category?: FrigoCategory;
  dlc?: string; // Date Limite de Consommation (format ISO)
  price?: number; // Prix d'achat actuel
  store?: string; // Magasin d'achat actuel
  priceHistory?: PriceHistoryEntry[]; // Historique des prix et magasins
}

const FRIGO_STORAGE_KEY = 'nutriscan_frigo';
const DEFAULT_CATEGORY: FrigoCategory = 'Autre';
const CSV_HEADERS = [
  'product_name',
  'brands',
  'image_url',
  'nutriscore_grade',
  'quantity_label',
  'quantity',
  'category',
  'dlc',
  'price',
  'store',
  'addedAt'
];

const createItemId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const normalizeCategory = (value: any): FrigoCategory => {
  const allowed: FrigoCategory[] = [
    'Fruits & Légumes',
    'Viandes & Poissons',
    'Produits Laitiers',
    'Épicerie',
    'Boissons',
    'Surgelés',
    'Boulangerie',
    'Autre'
  ];
  if (allowed.includes(value)) {
    return value;
  }
  return DEFAULT_CATEGORY;
};

const normalizeString = (value?: string | null) => (value ?? '').trim();

const safeNumber = (value: any): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getProductKey = (product: Product) =>
  `${normalizeString(product.product_name).toLowerCase()}|${normalizeString(product.brands).toLowerCase()}`;

const toCsvValue = (value: string | number | undefined | null) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[;"\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const convertItemsToCSV = (items: FrigoItem[]): string => {
  const rows = [CSV_HEADERS.join(';')];
  items.forEach(item => {
    rows.push([
      toCsvValue(item.product.product_name),
      toCsvValue(item.product.brands),
      toCsvValue(item.product.image_url),
      toCsvValue(item.product.nutriscore_grade),
      toCsvValue(item.product.quantity),
      toCsvValue(item.quantity),
      toCsvValue(item.category),
      toCsvValue(item.dlc),
      toCsvValue(item.price),
      toCsvValue(item.store),
      toCsvValue(item.addedAt)
    ].join(';'));
  });
  return rows.join('\n');
};

const splitCsvLine = (line: string, delimiter: string) => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map(cell => cell.trim());
};

const parseCsv = (content: string): Record<string, string>[] => {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return [];
  const lines = normalized.split('\n').filter(Boolean);
  if (lines.length === 0) return [];

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = splitCsvLine(lines[0], delimiter);

  return lines.slice(1).map(line => {
    const values = splitCsvLine(line, delimiter);
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? '';
    });
    return record;
  });
};

const parseJsonExport = (payload: string): any[] => {
  const data = JSON.parse(payload);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.frigo)) return data.frigo;
  return [];
};

const normalizeProduct = (raw: any): Product | null => {
  if (!raw) return null;
  const productName = normalizeString(raw.product?.product_name ?? raw.product_name);
  const brands = normalizeString(raw.product?.brands ?? raw.brands);
  if (!productName || !brands) {
    return null;
  }
  return {
    product_name: productName,
    brands,
    image_url: raw.product?.image_url ?? raw.image_url ?? '',
    ingredients_text_with_allergens: raw.product?.ingredients_text_with_allergens ?? '',
    nutriments: raw.product?.nutriments ?? {},
    quantity: raw.product?.quantity ?? raw.quantity_label ?? '',
    nutriscore_grade: raw.product?.nutriscore_grade ?? raw.nutriscore_grade ?? ''
  };
};

const createItemFromRaw = (raw: any): FrigoItem | null => {
  const product = normalizeProduct(raw);
  if (!product) {
    return null;
  }

  let quantity = safeNumber(raw.quantity);
  if (quantity === undefined || quantity < 1) {
    quantity = 1;
  }

  const category = normalizeCategory(raw.category ?? raw.categoryLabel ?? DEFAULT_CATEGORY);

  const item: FrigoItem = {
    id: raw.id ?? createItemId(),
    product,
    addedAt: raw.addedAt ?? new Date().toISOString(),
    quantity,
    category,
    dlc: raw.dlc || undefined,
    price: safeNumber(raw.price),
    store: normalizeString(raw.store) || undefined
  };

  if (Array.isArray(raw.priceHistory)) {
    item.priceHistory = raw.priceHistory.filter((entry: any) =>
      entry &&
      typeof entry.price === 'number' &&
      entry.store &&
      entry.date
    );
  }

  return item;
};

const buildShoppingListFromItems = (items: FrigoItem[]): string => {
  if (items.length === 0) {
    return 'Liste de courses NutriScan\n\nAucun produit enregistré pour le moment.';
  }

  const groups = new Map<string, FrigoItem[]>();
  items.forEach(item => {
    const key = item.category ?? DEFAULT_CATEGORY;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });

  const lines: string[] = [
    'Liste de courses NutriScan',
    `Générée le ${new Date().toLocaleString('fr-FR')}`,
    ''
  ];

  Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, groupedItems]) => {
      lines.push(`${category} :`);
      groupedItems
        .sort((a, b) => a.product.product_name.localeCompare(b.product.product_name))
        .forEach(item => {
          const qty = item.quantity ? `x${item.quantity}` : '';
          const brand = item.product.brands ? ` (${item.product.brands})` : '';
          const dlc = item.dlc ? `• DLC ${new Date(item.dlc).toLocaleDateString('fr-FR')}` : '';
          const suffix = [qty, dlc].filter(Boolean).join(' ').trim();
          lines.push(suffix ? `  • ${item.product.product_name}${brand} ${suffix}` : `  • ${item.product.product_name}${brand}`);
        });
      lines.push('');
    });

  lines.push(`Total produits: ${items.length}`);
  return lines.join('\n');
};

export const frigoService = {
  // Récupérer tous les produits du frigo
  getAll(): FrigoItem[] {
    try {
      const stored = localStorage.getItem(FRIGO_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération du frigo:', error);
      return [];
    }
  },

  // Ajouter un produit au frigo
  add(product: Product, quantity: number = 1, category?: FrigoCategory, dlc?: string, price?: number, store?: string): boolean {
    try {
      const items = this.getAll();
      const existingIndex = items.findIndex(
        item => item.product.product_name === product.product_name && 
                item.product.brands === product.brands
      );

      const newItem: FrigoItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        product,
        addedAt: new Date().toISOString(),
        quantity: existingIndex >= 0 ? (items[existingIndex].quantity || 0) + quantity : quantity,
        category: category || 'Autre',
        dlc: dlc,
        price: price,
        store: store
      };

      if (existingIndex >= 0) {
        // Mettre à jour l'item existant avec les nouvelles infos
        items[existingIndex] = { ...items[existingIndex], ...newItem };
      } else {
        items.push(newItem);
      }

      localStorage.setItem(FRIGO_STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout au frigo:', error);
      return false;
    }
  },

  // Supprimer un produit du frigo
  remove(id: string): boolean {
    try {
      const items = this.getAll();
      const filtered = items.filter(item => item.id !== id);
      localStorage.setItem(FRIGO_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du frigo:', error);
      return false;
    }
  },

  // Vérifier si un produit est dans le frigo
  isInFrigo(product: Product): boolean {
    const items = this.getAll();
    return items.some(
      item => item.product.product_name === product.product_name &&
              item.product.brands === product.brands
    );
  },

  // Obtenir un produit du frigo par nom et marque
  getByProduct(product: Product): FrigoItem | null {
    const items = this.getAll();
    const found = items.find(
      item => item.product.product_name === product.product_name &&
              item.product.brands === product.brands
    );
    return found || null;
  },

  // Incrémenter la quantité d'un produit existant
  incrementQuantity(id: string, amount: number = 1): boolean {
    try {
      const items = this.getAll();
      const item = items.find(i => i.id === id);
      if (item) {
        item.quantity = (item.quantity || 1) + amount;
        localStorage.setItem(FRIGO_STORAGE_KEY, JSON.stringify(items));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation de la quantité:', error);
      return false;
    }
  },

  // Obtenir le nombre total de produits dans le frigo
  getCount(): number {
    return this.getAll().length;
  },

  // Vider complètement le frigo
  clear(): boolean {
    try {
      localStorage.removeItem(FRIGO_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Erreur lors du vidage du frigo:', error);
      return false;
    }
  },

  // Mettre à jour la quantité d'un produit
  updateQuantity(id: string, quantity: number): boolean {
    try {
      const items = this.getAll();
      const item = items.find(i => i.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity);
        localStorage.setItem(FRIGO_STORAGE_KEY, JSON.stringify(items));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      return false;
    }
  },

  // Obtenir les produits par catégorie
  getByCategory(category: FrigoCategory): FrigoItem[] {
    return this.getAll().filter(item => item.category === category);
  },

  // Obtenir toutes les catégories utilisées
  getCategories(): FrigoCategory[] {
    const items = this.getAll();
    const categories = new Set<FrigoCategory>();
    items.forEach(item => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    return Array.from(categories);
  },

  // Obtenir les produits avec DLC proche (dans les 3 prochains jours)
  getExpiringSoon(): FrigoItem[] {
    const items = this.getAll();
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    
    return items.filter(item => {
      if (!item.dlc) return false;
      const dlcDate = new Date(item.dlc);
      return dlcDate >= today && dlcDate <= threeDaysLater;
    });
  },

  // Obtenir les produits expirés
  getExpired(): FrigoItem[] {
    const items = this.getAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return items.filter(item => {
      if (!item.dlc) return false;
      const dlcDate = new Date(item.dlc);
      dlcDate.setHours(0, 0, 0, 0);
      return dlcDate < today;
    });
  },

  // Mettre à jour un produit
  update(id: string, updates: Partial<FrigoItem>): boolean {
    try {
      const items = this.getAll();
      const item = items.find(i => i.id === id);
      if (item) {
        // Si le prix ou le magasin change, ajouter à l'historique
        if ((updates.price !== undefined || updates.store !== undefined) && 
            (updates.price !== item.price || updates.store !== item.store)) {
          const currentPrice = updates.price ?? item.price;
          const currentStore = updates.store ?? item.store;
          
          if (currentPrice !== undefined && currentStore !== undefined) {
            const historyEntry: PriceHistoryEntry = {
              price: currentPrice,
              store: currentStore,
              date: new Date().toISOString()
            };
            
            if (!item.priceHistory) {
              item.priceHistory = [];
            }
            
            // Ajouter la nouvelle entrée à l'historique
            item.priceHistory.push(historyEntry);
            
            // Limiter l'historique à 10 entrées
            if (item.priceHistory.length > 10) {
              item.priceHistory = item.priceHistory.slice(-10);
            }
          }
        }
        
        Object.assign(item, updates);
        localStorage.setItem(FRIGO_STORAGE_KEY, JSON.stringify(items));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      return false;
    }
  },

  // Obtenir l'historique des prix d'un produit
  getPriceHistory(id: string): PriceHistoryEntry[] {
    const items = this.getAll();
    const item = items.find(i => i.id === id);
    return item?.priceHistory || [];
  },

  // Calculer la variation de prix par rapport au dernier achat
  getPriceVariation(id: string): { amount: number; percentage: number } | null {
    const history = this.getPriceHistory(id);
    if (history.length < 2) return null;
    
    const latest = history[history.length - 1];
    const previous = history[history.length - 2];
    
    const amount = latest.price - previous.price;
    const percentage = (amount / previous.price) * 100;
    
    return { amount, percentage };
  },

  exportData(format: FrigoExportFormat = 'json'): string {
    const items = this.getAll();
    if (format === 'csv') {
      return convertItemsToCSV(items);
    }

    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        count: items.length,
        items
      },
      null,
      2
    );
  },

  importData(payload: string, format: FrigoExportFormat = 'json', options: { merge?: boolean } = {}): FrigoImportResult {
    const merge = options.merge ?? true;
    let rawItems: any[] = [];

    try {
      if (format === 'csv') {
        rawItems = parseCsv(payload);
      } else {
        rawItems = parseJsonExport(payload);
      }
    } catch (error) {
      console.error('Erreur de parsing lors de l’import:', error);
      throw new Error('Fichier illisible ou corrompu.');
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new Error('Aucune donnée valide trouvée dans le fichier.');
    }

    const existingItems = merge ? this.getAll() : [];
    const itemsMap = new Map<string, FrigoItem>();
    existingItems.forEach(item => {
      itemsMap.set(getProductKey(item.product), item);
    });

    let created = 0;
    let updated = 0;
    let skipped = 0;

    rawItems.forEach(raw => {
      const item = createItemFromRaw(raw);
      if (!item) {
        skipped++;
        return;
      }

      const key = getProductKey(item.product);
      if (itemsMap.has(key)) {
        const existing = itemsMap.get(key)!;
        itemsMap.set(key, { ...existing, ...item, id: existing.id });
        updated++;
      } else {
        itemsMap.set(key, item);
        created++;
      }
    });

    const nextItems = Array.from(itemsMap.values());
    localStorage.setItem(FRIGO_STORAGE_KEY, JSON.stringify(nextItems));

    return {
      total: rawItems.length,
      created,
      updated,
      skipped
    };
  },

  buildShoppingList(items?: FrigoItem[]): string {
    const source = items ?? this.getAll();
    return buildShoppingListFromItems(source);
  }
};

