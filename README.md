# 🥗 Scan AI

**Application mobile web intelligente pour scanner, analyser et gérer vos produits alimentaires avec l'aide de l'IA.**

Scan AI combine la puissance de l'API OpenFoodFacts et de Google Gemini AI pour vous offrir une expérience complète de gestion nutritionnelle. Scannez un code-barres, obtenez des informations détaillées sur le produit, discutez avec un assistant IA, et gérez votre frigo virtuel avec suivi des dates de péremption et historique des prix.

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Lancement](#-lancement)
- [Structure du projet](#-structure-du-projet)
- [Variables d'environnement](#-variables-denvironnement)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

---

## ✨ Fonctionnalités

### MVP (Minimum Viable Product)

- **🔍 Scanner de code-barres**
  - Saisie manuelle du code EAN-13
  - Scanner via caméra (navigateur)
  - Validation automatique du format

- **📦 Affichage des produits**
  - Informations complètes (nom, marque, ingrédients, nutriments)
  - Nutri-Score visuel (A à E)
  - Image du produit
  - Quantité et détails nutritionnels

- **🤖 Assistant IA conversationnel**
  - Chat contextuel basé sur le produit scanné
  - Réponses intelligentes via Google Gemini 2.5 Flash
  - Recherche web intégrée pour informations complémentaires
  - Text-to-Speech (TTS) pour lecture vocale des réponses
  - Sources citées pour transparence

- **🧊 Gestion du frigo virtuel**
  - Ajout de produits avec métadonnées
  - Catégorisation (Fruits & Légumes, Viandes & Poissons, etc.)
  - Suivi des quantités
  - Dates de péremption (DLC) avec notifications
  - Historique des prix et magasins
  - Filtrage par catégorie
  - Modification et suppression d'items

- **🔔 Notifications intelligentes**
  - Alertes pour produits expirés
  - Rappels pour produits expirant sous 3 jours
  - Notifications en temps réel

- **💅 Interface moderne**
  - Design glassmorphism
  - Responsive (mobile-first)
  - Animations fluides
  - Thème sombre optimisé
  - Navigation intuitive avec bottom nav

---

## 🛠️ Stack technique

### Frontend

- **React 19.2.0** - Bibliothèque UI moderne
- **TypeScript 5.8.2** - Typage statique
- **Vite 6.2.0** - Build tool rapide
- **Tailwind CSS** - Framework CSS utility-first
- **React DOM 19.2.0** - Rendu React

### Services & APIs

- **Google Gemini AI** (`@google/genai 1.29.1`)
  - Modèle : `gemini-2.5-flash` pour le chat
  - Modèle : `gemini-2.5-flash-preview-tts` pour la synthèse vocale
  - Recherche web intégrée (Google Search grounding)

- **OpenFoodFacts API**
  - Endpoint : `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
  - Données produits, nutriments, Nutri-Score

### Stockage

- **localStorage** - Persistance locale des données du frigo
  - Clé : `nutriscan_frigo`
  - Format : JSON

### Outils de développement

- **@vitejs/plugin-react** - Plugin React pour Vite
- **@types/node** - Types TypeScript pour Node.js

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18 ou supérieure recommandée)
  - Vérifiez avec : `node --version`
- **npm** (généralement inclus avec Node.js)
  - Vérifiez avec : `npm --version`
- **Clé API Google Gemini**
  - Obtenez-la sur : [Google AI Studio](https://aistudio.google.com/apikey)

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd nutriscan-ai
```

### 2. Installer les dépendances

```bash
npm install
```

Cette commande installera toutes les dépendances listées dans `package.json`.

### 3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# .env
GEMINI_API_KEY=votre_cle_api_google_gemini_ici
```

**Important** : Ne commitez jamais votre fichier `.env` dans le dépôt Git. Il est déjà ignoré par `.gitignore`.

---

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Obligatoire | Exemple |
|----------|-------------|-------------|---------|
| `GEMINI_API_KEY` | Clé API Google Gemini pour le chat et TTS | ✅ Oui | `AIzaSy...` |

### Configuration Vite

Le projet utilise Vite avec les paramètres suivants :

- **Port** : `3000` (configurable dans `vite.config.ts`)
- **Host** : `0.0.0.0` (accessible depuis le réseau local)
- **Alias** : `@` pointe vers la racine du projet

---

## 🎯 Lancement

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur :
- **Local** : `http://localhost:3000`
- **Réseau** : `http://[votre-ip]:3000`

Le serveur de développement Vite offre :
- Hot Module Replacement (HMR)
- Rechargement automatique
- Source maps pour le débogage

### Build de production

```bash
npm run build
```

Cette commande génère les fichiers optimisés dans le dossier `dist/`.

### Prévisualisation du build

```bash
npm run preview
```

Permet de tester le build de production localement avant déploiement.

---

## 📁 Structure du projet

```
nutriscan-ai/
├── components/              # Composants React
│   ├── AddToFrigoModal.tsx      # Modal d'ajout au frigo
│   ├── BarcodeScanner.tsx       # Scanner de code-barres
│   ├── BottomNav.tsx            # Navigation inférieure
│   ├── CameraScanner.tsx        # Scanner caméra
│   ├── Chat.tsx                 # Interface de chat IA
│   ├── DLCNotifications.tsx     # Notifications DLC
│   ├── Frigo.tsx                # Vue du frigo
│   ├── Header.tsx               # En-tête de l'app
│   ├── Loader.tsx               # Composant de chargement
│   ├── ModifyFrigoItemModal.tsx # Modal de modification
│   ├── PriceHistoryModal.tsx    # Modal historique prix
│   ├── ProductDisplay.tsx       # Affichage produit
│   └── ProductExistsModal.tsx   # Modal produit existant
│
├── hooks/                  # Hooks React personnalisés
│   └── useAudioPlayer.ts        # Hook pour lecture audio TTS
│
├── services/               # Services métier
│   ├── frigoService.ts         # Gestion localStorage frigo
│   ├── geminiService.ts         # Service Google Gemini AI
│   ├── openFoodFactsService.ts  # Service OpenFoodFacts API
│   └── ttsService.ts            # Service Text-to-Speech
│
├── utils/                  # Utilitaires
│   └── audioUtils.ts           # Utilitaires audio (décodage)
│
├── dist/                   # Build de production (généré)
│
├── App.tsx                 # Composant principal
├── index.tsx               # Point d'entrée React
├── index.css               # Styles globaux Tailwind
├── types.ts                # Définitions TypeScript
├── vite.config.ts          # Configuration Vite
├── tsconfig.json           # Configuration TypeScript
├── package.json            # Dépendances et scripts
└── README.md               # Documentation principale
```

### Architecture des composants

```
App.tsx (Root)
├── Header
├── Main Content (Router)
│   ├── BarcodeScanner (View.Scanner)
│   ├── ProductDisplay (View.Product)
│   ├── Chat (View.Chat)
│   └── Frigo (View.Frigo)
├── Modals
│   ├── AddToFrigoModal
│   ├── ProductExistsModal
│   └── ModifyFrigoItemModal
├── DLCNotifications
└── BottomNav
```

---

## 🔐 Variables d'environnement

### Fichier `.env`

Créez un fichier `.env` à la racine :

```env
GEMINI_API_KEY=votre_cle_api_ici
```

### Fichier `.env.example` (recommandé)

Créez un fichier `.env.example` pour documenter les variables nécessaires :

```env
GEMINI_API_KEY=
```

---

## 🤝 Contribuer

Nous accueillons les contributions ! Voici comment procéder :

### 1. Fork et clone

```bash
git clone <votre-fork>
cd nutriscan-ai
```

### 2. Créer une branche

```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 3. Bonnes pratiques

- **Code style** : Suivez les conventions TypeScript/React existantes
- **Commits** : Messages clairs et descriptifs
- **Tests** : Testez vos modifications localement
- **Formatage** : Utilisez un formatter (Prettier recommandé)

### 4. Commit et push

```bash
git add .
git commit -m "feat: ajout de la fonctionnalité X"
git push origin feature/ma-nouvelle-fonctionnalite
```

### 5. Pull Request

Ouvrez une PR sur le dépôt principal avec :
- Description claire des changements
- Screenshots si UI modifiée
- Tests effectués

### Guidelines

- **Nommage** : Utilisez des noms explicites (camelCase pour variables/fonctions, PascalCase pour composants)
- **Types** : Typage strict TypeScript, évitez `any`
- **Composants** : Composants fonctionnels avec hooks
- **Services** : Logique métier dans `services/`
- **Styles** : Tailwind CSS uniquement, pas de CSS inline

---

## 📄 Licence

Ce projet est sous licence **MIT**.

Voir le fichier `LICENSE` pour plus de détails.

---

## 🔗 Ressources

- [Documentation React](https://react.dev/)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)
- [OpenFoodFacts API](https://world.openfoodfacts.org/data)
- [Google Gemini AI](https://ai.google.dev/)

---

## 📞 Support

Pour toute question ou problème :

1. Vérifiez la [documentation d'architecture](./ARCHITECTURE.md)
2. Consultez les [docs localStorage](./localStorage_DOCS.md)
3. Ouvrez une [issue](../../issues) sur GitHub

---

**Développé avec ❤️ pour une alimentation plus intelligente**
