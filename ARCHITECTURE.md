# 🏗️ Architecture de Scan AI

Ce document décrit l'architecture technique de l'application Scan AI, son organisation, ses flux de données et ses choix de conception.

---

## 📐 Vue d'ensemble

Scan AI est une **Single Page Application (SPA)** React construite avec TypeScript et Vite. L'application est entièrement côté client (frontend-only) et utilise des APIs externes pour les données et l'IA.

### Architecture générale

```
┌─────────────────────────────────────────────────────────────┐
│                    Scan AI (Frontend)                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │   Services   │  │  localStorage │     │
│  │  Components  │◄─┤   Layer      │◄─┤   (Storage)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                                 │
│         └──────────────────┘                                 │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ OpenFoodFacts│    │ Google Gemini│    │  Browser API │
│     API      │    │     AI API   │    │  (Camera,    │
│              │    │              │    │   Audio)     │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 🎯 Principes de conception

### 1. **Architecture en couches**

- **Présentation** : Composants React (`components/`)
- **Logique métier** : Services (`services/`)
- **Données** : localStorage via services
- **APIs externes** : Services dédiés

### 2. **Séparation des responsabilités**

- Chaque service a une responsabilité unique
- Les composants sont "dumb" (présentation uniquement)
- La logique métier est centralisée dans les services

### 3. **Type safety**

- TypeScript strict pour éviter les erreurs à l'exécution
- Interfaces définies dans `types.ts`
- Pas d'utilisation de `any` (sauf cas exceptionnels)

---

## 📦 Structure détaillée

### 1. Composants React (`components/`)

#### Composants principaux

- **`App.tsx`** : Composant racine, gestion du routing interne (View enum)
- **`BarcodeScanner.tsx`** : Interface de scan (manuel + caméra)
- **`ProductDisplay.tsx`** : Affichage détaillé du produit
- **`Chat.tsx`** : Interface de conversation avec l'IA
- **`Frigo.tsx`** : Vue liste du frigo virtuel

#### Composants UI

- **`Header.tsx`** : En-tête avec navigation
- **`BottomNav.tsx`** : Navigation inférieure mobile
- **`Loader.tsx`** : Indicateur de chargement
- **`DLCNotifications.tsx`** : Système de notifications

#### Modals

- **`AddToFrigoModal.tsx`** : Formulaire d'ajout au frigo
- **`ProductExistsModal.tsx`** : Gestion produit déjà présent
- **`ModifyFrigoItemModal.tsx`** : Modification d'un item
- **`PriceHistoryModal.tsx`** : Historique des prix

#### Pattern de composants

```typescript
// Structure type d'un composant
interface ComponentProps {
  // Props typées
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks React
  const [state, setState] = useState();
  
  // Handlers
  const handleAction = () => { /* ... */ };
  
  // Render
  return (/* JSX */);
};
```

### 2. Services (`services/`)

#### `openFoodFactsService.ts`

**Responsabilité** : Communication avec l'API OpenFoodFacts

```typescript
fetchProductByBarcode(barcode: string): Promise<Product>
```

**Flux** :
1. Requête GET vers `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
2. Validation de la réponse
3. Transformation en type `Product`
4. Gestion des erreurs

#### `geminiService.ts`

**Responsabilité** : Communication avec Google Gemini AI pour le chat

```typescript
getChatResponse(prompt: string, productContext: string): Promise<{ text: string, sources: GroundingChunk[] }>
```

**Flux** :
1. Construction du prompt avec contexte produit
2. Appel API Gemini avec recherche web activée
3. Extraction du texte et des sources
4. Retour formaté

**Configuration** :
- Modèle : `gemini-2.5-flash`
- Tool : `googleSearch` (grounding web)

#### `ttsService.ts`

**Responsabilité** : Génération de synthèse vocale

```typescript
generateSpeech(text: string): Promise<string> // Retourne base64 audio
```

**Flux** :
1. Appel API Gemini TTS
2. Modèle : `gemini-2.5-flash-preview-tts`
3. Voix : `Kore` (pré-configurée)
4. Retour audio en base64

#### `frigoService.ts`

**Responsabilité** : Gestion du stockage localStorage pour le frigo

**Clé de stockage** : `nutriscan_frigo`

**Méthodes principales** :
- `getAll()` : Récupère tous les items
- `add()` : Ajoute un produit
- `remove()` : Supprime un produit
- `update()` : Met à jour un produit
- `getByProduct()` : Recherche par produit
- `getExpiringSoon()` : Produits expirant bientôt
- `getExpired()` : Produits expirés
- `getPriceHistory()` : Historique des prix

**Structure des données** :

```typescript
interface FrigoItem {
  id: string;
  product: Product;
  addedAt: string;
  quantity?: number;
  category?: FrigoCategory;
  dlc?: string; // ISO date
  price?: number;
  store?: string;
  priceHistory?: PriceHistoryEntry[];
}
```

### 3. Hooks personnalisés (`hooks/`)

#### `useAudioPlayer.ts`

**Responsabilité** : Gestion de la lecture audio pour TTS

**Fonctionnalités** :
- Création/gestion d'`AudioContext`
- Décodage base64 → AudioBuffer
- Lecture/arrêt de l'audio
- État de lecture (`isPlaying`, `isGenerating`)

**Utilisation** :
```typescript
const { play, isPlaying, isGenerating, setIsGenerating } = useAudioPlayer();
await play(base64Audio);
```

### 4. Utilitaires (`utils/`)

#### `audioUtils.ts`

**Fonctions** :
- `decode(base64: string)` : Décodage base64 → Uint8Array
- `decodeAudioData()` : Conversion en AudioBuffer

---

## 🔄 Flux de données

### 1. Scan d'un produit

```
User Input (Barcode)
    │
    ▼
BarcodeScanner
    │
    ▼
App.handleScan()
    │
    ├─► openFoodFactsService.fetchProductByBarcode()
    │       │
    │       ▼
    │   OpenFoodFacts API
    │       │
    │       ▼
    │   Product Data
    │
    ├─► frigoService.getByProduct()
    │       │
    │       ▼
    │   localStorage
    │       │
    │       ▼
    │   Existing Item? → ProductExistsModal
    │   New Item? → ProductDisplay
    │
    ▼
ProductDisplay (View.Product)
```

### 2. Chat avec l'IA

```
User Message
    │
    ▼
Chat.handleSubmit()
    │
    ├─► Construction du contexte produit
    │
    ├─► geminiService.getChatResponse()
    │       │
    │       ├─► Google Gemini API
    │       │       │
    │       │       ├─► Recherche web (si nécessaire)
    │       │       │
    │       │       ▼
    │       │   Response (text + sources)
    │       │
    │       ▼
    │   ChatMessage ajouté
    │
    ▼
Affichage dans Chat UI
    │
    ├─► Option TTS
    │       │
    │       ▼
    │   ttsService.generateSpeech()
    │       │
    │       ▼
    │   Google Gemini TTS API
    │       │
    │       ▼
    │   Base64 Audio
    │       │
    │       ▼
    │   useAudioPlayer.play()
    │       │
    │       ▼
    │   AudioContext → Lecture
```

### 3. Gestion du frigo

```
User Action (Add/Update/Delete)
    │
    ▼
frigoService.[method]()
    │
    ├─► getAll() → localStorage.getItem('nutriscan_frigo')
    │
    ├─► Modification des données
    │
    ├─► localStorage.setItem('nutriscan_frigo', JSON.stringify(items))
    │
    ▼
UI mise à jour (Frigo.tsx)
    │
    ├─► DLCNotifications vérifie les dates
    │
    ▼
Notifications affichées si nécessaire
```

---

## 🎨 Gestion d'état

### État local (useState)

L'application utilise principalement **React useState** pour la gestion d'état :

- **App.tsx** : État global de l'application
  - `view` : Vue actuelle (View enum)
  - `product` : Produit actuellement affiché
  - `isLoading` : État de chargement
  - `error` : Messages d'erreur
  - `frigoCount` : Nombre d'items dans le frigo

- **Composants** : État local pour UI
  - Modals (ouvert/fermé)
  - Formulaires (valeurs)
  - Chat (messages)

### État persistant (localStorage)

- **frigoService** : Gestion centralisée du localStorage
- **Clé unique** : `nutriscan_frigo`
- **Format** : JSON array de `FrigoItem[]`

### Pas de state management externe

L'application n'utilise **pas** de bibliothèque comme Redux ou Zustand car :
- L'état est relativement simple
- Pas de partage d'état complexe entre composants
- localStorage suffit pour la persistance

---

## 🔌 Intégrations externes

### 1. OpenFoodFacts API

**Endpoint** : `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`

**Méthode** : GET

**Réponse** :
```json
{
  "status": 1,
  "product": {
    "product_name": "...",
    "image_url": "...",
    "brands": "...",
    "nutriments": {...},
    "nutriscore_grade": "a"
  }
}
```

**Gestion d'erreurs** :
- `status === 0` → Produit non trouvé
- `!response.ok` → Erreur réseau
- Try/catch pour erreurs inattendues

### 2. Google Gemini AI

**SDK** : `@google/genai`

**Modèles utilisés** :
- **Chat** : `gemini-2.5-flash`
- **TTS** : `gemini-2.5-flash-preview-tts`

**Configuration** :
- API Key via variable d'environnement
- Recherche web activée pour le chat
- Voix TTS : `Kore`

**Rate limiting** : Géré par Google (pas de gestion côté client)

### 3. Browser APIs

- **Camera API** : `getUserMedia()` pour le scanner
- **Audio API** : `AudioContext` pour la lecture TTS
- **localStorage** : Stockage persistant

---

## 🎯 Routing interne

L'application utilise un **routing manuel** via un enum `View` :

```typescript
enum View {
  Scanner,  // Vue par défaut
  Product,  // Détails produit
  Chat,     // Chat IA
  Frigo     // Liste du frigo
}
```

**Avantages** :
- Simple pour une SPA
- Pas de dépendance externe (React Router)
- Contrôle total sur la navigation

**Navigation** :
- `BottomNav` : Navigation principale
- `Header` : Bouton retour
- Handlers dans `App.tsx`

---

## 🎨 Styling

### Tailwind CSS

- **Approche** : Utility-first
- **Configuration** : Via `index.css` (pas de `tailwind.config.js` visible)
- **Thème** : Dark mode par défaut

### Classes personnalisées

Définies dans `index.css` :

- **Glassmorphism** : `.glass-card`, `.glass-header`, `.glass-button`, etc.
- **Animations** : `.animate-fade-in`, `.animate-slide-up`, etc.
- **Responsive** : Mobile-first avec breakpoints Tailwind

### Design System

- **Couleurs principales** : Cyan (`cyan-400`), Blue (`blue-400`)
- **Fond** : Gradient dark (`from-gray-900 via-gray-800 to-gray-900`)
- **Typographie** : Sans-serif (système)

---

## 🔒 Sécurité

### Variables d'environnement

- **API Keys** : Stockées dans `.env` (non commitées)
- **Vite** : Injection via `define` dans `vite.config.ts`

### Données utilisateur

- **localStorage** : Données locales uniquement (pas de serveur)
- **Pas d'authentification** : Application locale

### APIs externes

- **HTTPS** : Toutes les requêtes en HTTPS
- **CORS** : Géré par les APIs (OpenFoodFacts, Gemini)

---

## 🚀 Performance

### Optimisations

1. **Code splitting** : Vite le fait automatiquement
2. **Lazy loading** : Images avec `loading="lazy"`
3. **Memoization** : `useMemo` pour calculs coûteux (Frigo)
4. **Debouncing** : À implémenter si nécessaire (recherche)

### Bundle size

- **Vite** : Tree-shaking automatique
- **Tailwind** : Purge CSS en production
- **Dependencies** : Minimales (React, Gemini SDK)

---

## 📱 Responsive Design

### Mobile-first

- **Breakpoints Tailwind** : `sm:`, `md:`, `lg:`
- **Touch targets** : Minimum 44x44px (accessibilité)
- **Safe areas** : Support des encoches (iPhone)

### Adaptations

- **Navigation** : Bottom nav sur mobile, sidebar sur desktop (à implémenter)
- **Modals** : Plein écran sur mobile
- **Typography** : Tailles adaptatives

---

## 🔮 Évolutions possibles

### Court terme

- **State management** : Zustand ou Context API si complexité augmente
- **Routing** : React Router si besoin de routes URL
- **Tests** : Vitest + React Testing Library
- **PWA** : Service Worker pour mode offline

### Long terme

- **Backend** : API REST pour synchronisation multi-appareils
- **Base de données** : PostgreSQL/MongoDB pour données utilisateur
- **Authentification** : OAuth (Google, Apple)
- **Notifications push** : Service Worker + Push API

---

## 📚 Références

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Google Gemini AI](https://ai.google.dev/docs)
- [OpenFoodFacts API](https://world.openfoodfacts.org/data)

---

**Dernière mise à jour** : 2024

