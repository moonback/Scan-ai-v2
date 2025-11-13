
import { type Product } from '../types';

export type FrigoCategory = 
  | 'Fruits & Légumes'
  | 'Viandes & Poissons'
  | 'Produits Laitiers'
  | 'Épicerie'
  | 'Boissons'
  | 'Surgelés'
  | 'Boulangerie'
  | 'Autre';

export interface FrigoItem {
  id: string;
  product: Product;
  addedAt: string;
  quantity?: number;
  category?: FrigoCategory;
  dlc?: string; // Date Limite de Consommation (format ISO)
}

const FRIGO_STORAGE_KEY = 'nutriscan_frigo';

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
  add(product: Product, quantity: number = 1, category?: FrigoCategory, dlc?: string): boolean {
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
        dlc: dlc
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
        Object.assign(item, updates);
        localStorage.setItem(FRIGO_STORAGE_KEY, JSON.stringify(items));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      return false;
    }
  }
};

