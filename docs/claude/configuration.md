# Guide de Developpement - Royaume des Paraiges

Ce guide est destine aux assistants IA et developpeurs travaillant sur le projet.

## Vue d'ensemble du Projet

**Royaume des Paraiges** est une application mobile (iOS/Android) et web construite avec Expo et React Native. L'application offre une experience gamifiee autour de la degustation de bieres et des etablissements, incluant :

- Authentification utilisateur avec Supabase
- Catalogue de bieres et avis
- Repertoire d'etablissements
- Systeme de quetes
- Systeme de coupons et recompenses
- Fil d'actualites
- Fonctionnalites sociales (likes, commentaires)

## Stack Technique

### Technologies Principales
- **Framework**: Expo SDK 54.0.31 avec React 19.1.0
- **Langage**: TypeScript 5.9.2
- **React Native**: 0.81.5
- **Router**: Expo Router 6.0.15 (routing base sur les fichiers)
- **Gestion d'etat**: Redux Toolkit 2.8.2 + React Redux 9.2.0
- **Services Backend**:
  - **Supabase**: Authentification, base de donnees, stockage
  - **Directus**: Systeme de gestion de contenu (CMS)

### Deploiement
- **Web**: Vercel
- **Docker**: Disponible avec Dockerfile + nginx.conf

## Structure du Projet

```
royaume-paraiges-front/
├── app/                          # Routing base sur fichiers (Expo Router)
│   ├── (auth)/                   # Routes d'authentification
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Onglets principaux
│   │   ├── index.tsx
│   │   ├── beers.tsx
│   │   ├── establishments.tsx
│   │   ├── news.tsx
│   │   └── tavern.tsx
│   └── _layout.tsx               # Layout racine avec AuthProvider
│
├── src/
│   ├── core/                     # Fonctionnalites principales
│   │   ├── api/                  # Clients API (Supabase, Directus)
│   │   └── store/                # Configuration Redux store
│   │
│   ├── features/                 # Modules par fonctionnalite
│   │   ├── auth/                 # Authentification
│   │   ├── beers/                # Catalogue bieres
│   │   ├── establishments/       # Etablissements
│   │   ├── quests/               # Systeme de quetes
│   │   ├── coupons/              # Coupons
│   │   ├── gains/                # Recompenses
│   │   ├── receipts/             # Scan de tickets
│   │   ├── news/                 # Fil d'actualites
│   │   ├── likes/                # Likes
│   │   └── comments/             # Commentaires
│   │
│   ├── shared/                   # Utilitaires partages
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── config/                   # Fichiers de configuration
│
├── components/                   # Composants UI partages
├── constants/                    # Constantes
├── contexts/                     # Contextes globaux
├── hooks/                        # Hooks globaux
├── assets/                       # Images, polices, etc.
└── scripts/                      # Scripts de build
```

## Patterns d'Architecture

### 1. Organisation par Fonctionnalite
Chaque fonctionnalite est autonome dans `src/features/[nom-fonctionnalite]/`:
- `components/` - Composants UI specifiques
- `services/` - Appels API et logique metier
- `hooks/` - Hooks specifiques
- `types/` - Definitions TypeScript
- `context/` - Providers de contexte (si necessaire)
- `index.ts` - Exports de l'API publique

### 2. Pattern Service Layer
Exemple: `src/features/auth/services/authService.ts`
- Gere toute la communication API
- Transforme les erreurs en messages user-friendly
- Retourne des donnees typees
- Ne gere PAS l'etat UI

### 3. Pattern Context + Hooks
Exemple: `src/features/auth/`
- `context/AuthContext.tsx` - Fournit l'etat auth global
- `hooks/useAuth.ts` - Hook personnalise pour acceder au contexte
- Les composants utilisent le hook `useAuth()`, pas l'acces direct au contexte

## Concepts Cles

### Alias de Chemins
TypeScript est configure avec l'alias `@/*` pointant vers la racine:
```typescript
import { useAuth } from '@/src/features/auth';
import { ThemedView } from '@/components/ThemedView';
```

### Routing Base sur Fichiers (Expo Router)
- Les routes sont definies par la structure de fichiers dans `app/`
- `(auth)` et `(tabs)` sont des groupes de routes
- `_layout.tsx` definit les layouts
- Routes dynamiques: `[id].tsx`

### Variables d'Environnement
Expo requiert le prefixe `EXPO_PUBLIC_`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
EXPO_PUBLIC_DIRECTUS_URL=https://paraiges-directus.neodelta.dev
```

## Systeme d'Authentification

L'app utilise **Supabase Auth**:
- Authentification email/mot de passe
- Persistance de session
- Rafraichissement automatique des tokens
- Routes protegees

### Utilisation
```typescript
import { useAuth } from '@/src/features/auth';

function MyComponent() {
  const { user, session, loading, signIn, signOut } = useAuth();

  if (loading) return <ActivityIndicator />;
  if (!user) return <Text>Non authentifie</Text>;

  return <Text>Bonjour {user.email}</Text>;
}
```

## Commandes de Developpement

```bash
# Installer les dependances
npm install

# Demarrer le serveur de dev
npm start

# Demarrer par plateforme
npm run android
npm run ios
npm run web

# Build pour le web (production)
npm run build:web

# Linting & Type Checking
npm run lint
npm run type-check

# Generer les types
npm run supabase:types
npm run directus:types
```

## Conventions de Code

### Conventions de Nommage
- **Composants**: PascalCase (`ProfileMenu.tsx`)
- **Hooks**: camelCase avec prefixe `use` (`useAuth.ts`)
- **Services**: camelCase avec suffixe `Service` (`authService.ts`)
- **Types**: PascalCase (`User`, `BeerData`)
- **Constantes**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)

### Bonnes Pratiques TypeScript
- Toujours definir les types de retour
- Utiliser interfaces pour les formes d'objets
- Eviter `any`, utiliser `unknown` si necessaire
- Mode strict active

## Guidelines pour Agents IA

### Fichiers de Contexte Requis

**IMPORTANT**: Avant de travailler sur des taches backend, lire les fichiers de config:

#### Supabase (Donnees Utilisateurs, Auth, Storage)
- **`docs/supabase/configuration.md`** - Configuration complete incluant:
  - Project ID et URL API
  - Structure des tables avec statut RLS
  - Types/enums personnalises
  - Fonctions PostgreSQL
  - Triggers et vues materialisees
  - Schema relationnel complet

#### Directus (CMS, Donnees de Contenu)
- **`docs/directus/configuration.md`** - Configuration complete incluant:
  - URL et configuration SDK
  - Structure des collections
  - Tables de jonction M2M
  - Documentation des services
  - Patterns de requetes
  - Gestion des images

### Guidelines Generales

1. **Toujours lire le code existant** avant de faire des modifications
2. **Maintenir la structure par fonctionnalite**
3. **Utiliser TypeScript strictement**
4. **Suivre le pattern service layer**
5. **Respecter le flux d'authentification**
6. **Tester sur plusieurs plateformes**
7. **Verifier les variables d'environnement**
8. **Mettre a jour les types apres changements de schema**
9. **Suivre les conventions d'alias de chemins**
10. **Garder les fonctionnalites isolees**

### Avant de Faire des Modifications
- Lire le code existant pertinent
- Comprendre la structure de la fonctionnalite
- Verifier les patterns existants a suivre
- Considerer la compatibilite cross-platform

### Apres les Modifications
- Executer type checking: `npm run type-check`
- Executer linting: `npm run lint`
- Tester sur les plateformes cibles
- Mettre a jour la documentation si necessaire

---

**Derniere mise a jour**: 2026-01-20
**Version Projet**: 1.0.0
**Expo SDK**: 54
