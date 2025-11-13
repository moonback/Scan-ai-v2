# 💾 Documentation localStorage - Scan AI

Ce document décrit l'utilisation de localStorage dans Scan AI, les structures de données stockées, et les méthodes disponibles pour interagir avec le stockage local.

---

## 📋 Vue d'ensemble

Scan AI utilise **localStorage** du navigateur pour persister les données du frigo virtuel. Toutes les opérations sont gérées via le service `frigoService` situé dans `services/frigoService.ts`.

**Clé de stockage principale** : `nutriscan_frigo`

---

## 🗂️ Structure des données

### Clé : `nutriscan_frigo`

**Type** : `string` (JSON sérialisé)

**Contenu** : Tableau d'objets `FrigoItem[]`

### Interface `FrigoItem`

```typescript
interface FrigoItem {
  id: string;                    // Identifiant unique (timestamp + random)
  product: Product;              // Données produit OpenFoodFacts
  addedAt: string;               // Date d'ajout (ISO 8601)
  quantity?: number;             // Quantité (défaut: 1)
  category?: FrigoCategory;      // Catégorie du produit
  dlc?: string;                  // Date Limite de Consommation (ISO 8601)
  price?: number;                // Prix d'achat actuel (€)
  store?: string;                // Magasin d'achat actuel
  priceHistory?: PriceHistoryEntry[]; // Historique des prix
}
```

### Interface `Product` (OpenFoodFacts)

```typescript
interface Product {
  product_name: string;
  image_url: string;
  brands: string;
  ingredients_text_with_allergens: string;
  nutriments: { [key: string]: string | number };
  quantity: string;
  nutriscore_grade: string; // 'a' | 'b' | 'c' | 'd' | 'e'
}
```

### Interface `PriceHistoryEntry`

```typescript
interface PriceHistoryEntry {
  price: number;      // Prix en euros
  store: string;      // Nom du magasin
  date: string;       // Date d'achat (ISO 8601)
}
```

### Type `FrigoCategory`

```typescript
type FrigoCategory =
  | 'Fruits & Légumes'
  | 'Viandes & Poissons'
  | 'Produits Laitiers'
  | 'Épicerie'
  | 'Boissons'
  | 'Surgelés'
  | 'Boulangerie'
  | 'Autre';
```

---

## 🔧 API du Service frigoService

Toutes les méthodes sont disponibles via l'export `frigoService` :

```typescript
import { frigoService } from './services/frigoService';
```

### Méthodes de lecture

#### `getAll(): FrigoItem[]`

Récupère tous les produits du frigo.

**Retour** : Tableau de `FrigoItem[]` (vide si aucun produit)

**Exemple** :
```typescript
const items = frigoService.getAll();
console.log(`Vous avez ${items.length} produits dans votre frigo`);
```

**Gestion d'erreurs** : Retourne `[]` en cas d'erreur de parsing

---

#### `getByProduct(product: Product): FrigoItem | null`

Recherche un produit dans le frigo par nom et marque.

**Paramètres** :
- `product: Product` - Produit à rechercher

**Retour** : `FrigoItem | null`

**Exemple** :
```typescript
const existingItem = frigoService.getByProduct(product);
if (existingItem) {
  console.log('Produit déjà présent !');
}
```

**Critère de recherche** : `product_name` + `brands` (correspondance exacte)

---

#### `isInFrigo(product: Product): boolean`

Vérifie si un produit est présent dans le frigo.

**Paramètres** :
- `product: Product` - Produit à vérifier

**Retour** : `boolean`

**Exemple** :
```typescript
if (frigoService.isInFrigo(product)) {
  alert('Ce produit est déjà dans votre frigo !');
}
```

---

#### `getCount(): number`

Retourne le nombre total de produits dans le frigo.

**Retour** : `number`

**Exemple** :
```typescript
const count = frigoService.getCount();
console.log(`Votre frigo contient ${count} produits`);
```

---

#### `getByCategory(category: FrigoCategory): FrigoItem[]`

Filtre les produits par catégorie.

**Paramètres** :
- `category: FrigoCategory` - Catégorie à filtrer

**Retour** : `FrigoItem[]`

**Exemple** :
```typescript
const fruits = frigoService.getByCategory('Fruits & Légumes');
```

---

#### `getCategories(): FrigoCategory[]`

Retourne toutes les catégories utilisées dans le frigo.

**Retour** : `FrigoCategory[]` (tableau unique, sans doublons)

**Exemple** :
```typescript
const categories = frigoService.getCategories();
// ['Fruits & Légumes', 'Viandes & Poissons', ...]
```

---

#### `getExpiringSoon(): FrigoItem[]`

Retourne les produits expirant dans les 3 prochains jours.

**Retour** : `FrigoItem[]`

**Critère** : DLC entre aujourd'hui et +3 jours

**Exemple** :
```typescript
const expiringSoon = frigoService.getExpiringSoon();
if (expiringSoon.length > 0) {
  alert(`${expiringSoon.length} produits expirent bientôt !`);
}
```

---

#### `getExpired(): FrigoItem[]`

Retourne les produits déjà expirés.

**Retour** : `FrigoItem[]`

**Critère** : DLC < aujourd'hui

**Exemple** :
```typescript
const expired = frigoService.getExpired();
if (expired.length > 0) {
  console.warn(`${expired.length} produits expirés !`);
}
```

---

#### `getPriceHistory(id: string): PriceHistoryEntry[]`

Récupère l'historique des prix d'un produit.

**Paramètres** :
- `id: string` - ID du produit

**Retour** : `PriceHistoryEntry[]`

**Exemple** :
```typescript
const history = frigoService.getPriceHistory(item.id);
history.forEach(entry => {
  console.log(`${entry.date}: ${entry.price}€ chez ${entry.store}`);
});
```

---

#### `getPriceVariation(id: string): { amount: number; percentage: number } | null`

Calcule la variation de prix par rapport au dernier achat.

**Paramètres** :
- `id: string` - ID du produit

**Retour** : `{ amount: number; percentage: number } | null` (null si < 2 entrées)

**Exemple** :
```typescript
const variation = frigoService.getPriceVariation(item.id);
if (variation) {
  console.log(`Variation: ${variation.amount}€ (${variation.percentage}%)`);
}
```

---

### Méthodes d'écriture

#### `add(product: Product, quantity?: number, category?: FrigoCategory, dlc?: string, price?: number, store?: string): boolean`

Ajoute un produit au frigo.

**Paramètres** :
- `product: Product` - Produit à ajouter (obligatoire)
- `quantity?: number` - Quantité (défaut: 1)
- `category?: FrigoCategory` - Catégorie (défaut: 'Autre')
- `dlc?: string` - Date limite de consommation (ISO 8601)
- `price?: number` - Prix d'achat (€)
- `store?: string` - Magasin d'achat

**Retour** : `boolean` (true si succès)

**Comportement** :
- Si le produit existe déjà (même nom + marque), la quantité est incrémentée
- Sinon, un nouvel item est créé avec un ID unique

**Exemple** :
```typescript
const success = frigoService.add(
  product,
  2,
  'Fruits & Légumes',
  '2024-12-31',
  3.50,
  'Carrefour'
);
if (success) {
  console.log('Produit ajouté !');
}
```

---

#### `remove(id: string): boolean`

Supprime un produit du frigo.

**Paramètres** :
- `id: string` - ID du produit à supprimer

**Retour** : `boolean` (true si succès)

**Exemple** :
```typescript
if (frigoService.remove(item.id)) {
  console.log('Produit supprimé');
}
```

---

#### `update(id: string, updates: Partial<FrigoItem>): boolean`

Met à jour un produit existant.

**Paramètres** :
- `id: string` - ID du produit
- `updates: Partial<FrigoItem>` - Champs à mettre à jour

**Retour** : `boolean` (true si succès)

**Comportement spécial** :
- Si `price` ou `store` change, une nouvelle entrée est ajoutée à `priceHistory`
- L'historique est limité à 10 entrées maximum

**Exemple** :
```typescript
const success = frigoService.update(item.id, {
  quantity: 5,
  dlc: '2025-01-15',
  price: 4.20,
  store: 'Leclerc'
});
```

---

#### `incrementQuantity(id: string, amount?: number): boolean`

Incrémente la quantité d'un produit.

**Paramètres** :
- `id: string` - ID du produit
- `amount?: number` - Montant à ajouter (défaut: 1)

**Retour** : `boolean` (true si succès)

**Exemple** :
```typescript
frigoService.incrementQuantity(item.id, 2); // +2
```

---

#### `updateQuantity(id: string, quantity: number): boolean`

Met à jour la quantité d'un produit (remplace la valeur).

**Paramètres** :
- `id: string` - ID du produit
- `quantity: number` - Nouvelle quantité (minimum: 1)

**Retour** : `boolean` (true si succès)

**Exemple** :
```typescript
frigoService.updateQuantity(item.id, 10);
```

---

#### `clear(): boolean`

Vide complètement le frigo (supprime toutes les données).

**Retour** : `boolean` (true si succès)

**⚠️ Attention** : Action irréversible !

**Exemple** :
```typescript
if (confirm('Vider le frigo ?')) {
  frigoService.clear();
}
```

---

## 📝 Exemples d'utilisation

### Ajouter un produit avec toutes les métadonnées

```typescript
import { frigoService } from './services/frigoService';
import { fetchProductByBarcode } from './services/openFoodFactsService';

// 1. Récupérer le produit
const product = await fetchProductByBarcode('3017620422003');

// 2. Ajouter au frigo
const success = frigoService.add(
  product,
  3,                                    // quantité
  'Fruits & Légumes',                  // catégorie
  '2024-12-25',                        // DLC
  2.99,                                 // prix
  'Carrefour'                          // magasin
);
```

### Vérifier et gérer les produits expirés

```typescript
// Produits expirés
const expired = frigoService.getExpired();
expired.forEach(item => {
  console.log(`${item.product.product_name} est expiré !`);
  // Optionnel : supprimer automatiquement
  // frigoService.remove(item.id);
});

// Produits expirant bientôt
const expiringSoon = frigoService.getExpiringSoon();
expiringSoon.forEach(item => {
  const dlcDate = new Date(item.dlc!);
  const daysLeft = Math.ceil((dlcDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  console.log(`${item.product.product_name} expire dans ${daysLeft} jours`);
});
```

### Suivre l'historique des prix

```typescript
// Ajouter un produit avec prix
frigoService.add(product, 1, 'Épicerie', undefined, 2.50, 'Carrefour');

// Plus tard, mettre à jour le prix
const item = frigoService.getByProduct(product);
if (item) {
  frigoService.update(item.id, {
    price: 2.99,
    store: 'Leclerc'
  });
  
  // L'historique contient maintenant 2 entrées
  const history = frigoService.getPriceHistory(item.id);
  // [{ price: 2.50, store: 'Carrefour', date: '...' },
  //  { price: 2.99, store: 'Leclerc', date: '...' }]
  
  // Calculer la variation
  const variation = frigoService.getPriceVariation(item.id);
  // { amount: 0.49, percentage: 19.6 }
}
```

### Filtrer et afficher par catégorie

```typescript
// Obtenir toutes les catégories
const categories = frigoService.getCategories();

// Afficher les produits par catégorie
categories.forEach(category => {
  const items = frigoService.getByCategory(category);
  console.log(`${category}: ${items.length} produits`);
});
```

---

## 🔒 Gestion des erreurs

Toutes les méthodes du service gèrent les erreurs en interne :

- **Parsing JSON** : Try/catch avec retour de valeur par défaut
- **localStorage indisponible** : Retourne `[]` ou `false`
- **Quota dépassé** : Console.error (limite ~5-10MB selon navigateur)

**Recommandation** : Toujours vérifier le retour des méthodes d'écriture :

```typescript
const success = frigoService.add(product);
if (!success) {
  alert('Erreur lors de l\'ajout au frigo');
}
```

---

## 📊 Limites et contraintes

### localStorage

- **Taille maximale** : ~5-10MB (selon navigateur)
- **Synchronisation** : Aucune (données locales uniquement)
- **Persistance** : Survit aux redémarrages du navigateur
- **Suppression** : Possible via "Effacer les données du site"

### Données

- **Historique des prix** : Limité à 10 entrées par produit
- **ID unique** : Format `timestamp-random` (pas de collision garantie)

---

## 🧪 Tests manuels

### Vérifier le contenu localStorage

```javascript
// Dans la console du navigateur
const data = localStorage.getItem('nutriscan_frigo');
console.log(JSON.parse(data));
```

### Vider le localStorage

```javascript
// Dans la console
localStorage.removeItem('nutriscan_frigo');
// Ou vider tout
localStorage.clear();
```

### Simuler un quota dépassé

```javascript
// Remplir localStorage jusqu'à la limite
let i = 0;
try {
  while (true) {
    localStorage.setItem(`test_${i}`, 'x'.repeat(1024 * 1024));
    i++;
  }
} catch (e) {
  console.log(`Quota atteint après ${i}MB`);
}
```

---

## 🔄 Migration future

Si vous souhaitez migrer vers une base de données ou un backend :

1. **Exporter les données** :
```typescript
const exportData = () => {
  const items = frigoService.getAll();
  return JSON.stringify(items, null, 2);
};
```

2. **Importer les données** :
```typescript
const importData = (jsonData: string) => {
  const items: FrigoItem[] = JSON.parse(jsonData);
  items.forEach(item => {
    frigoService.add(item.product, item.quantity, item.category, item.dlc, item.price, item.store);
  });
};
```

---

## 📚 Références

- [MDN - localStorage](https://developer.mozilla.org/fr/docs/Web/API/Window/localStorage)
- [Service frigoService](../services/frigoService.ts)
- [Types TypeScript](../types.ts)

---

**Dernière mise à jour** : 2024

