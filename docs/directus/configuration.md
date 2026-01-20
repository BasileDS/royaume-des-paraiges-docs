# Configuration Directus - Royaume des Paraiges

## Vue d'ensemble

**Directus** est utilise comme CMS (Content Management System) headless pour gerer le contenu statique de l'application Royaume des Paraiges. Contrairement a Supabase qui gere les donnees utilisateurs, Directus est en **lecture seule** cote application.

### Informations de connexion

| Parametre | Valeur |
|-----------|--------|
| **URL** | `https://paraiges-directus.neodelta.dev` |
| **SDK** | `@directus/sdk` v20.1.0 |
| **Mode** | READ-ONLY (pas d'ecriture depuis l'app) |
| **Variable d'env** | `EXPO_PUBLIC_DIRECTUS_URL` |

---

## Architecture Client

### Fichier principal
**Emplacement**: `src/core/api/directus.ts`

```typescript
import { createDirectus, readItem, readItems, rest } from '@directus/sdk';

// Initialisation du client
const directus = createDirectus(directusUrl).with(rest());

// Exports disponibles
export { directus, readItem, readItems, getDirectusImageUrl };
```

### Gestion URL multi-plateforme

```typescript
const directusUrl = Platform.OS === 'web'
  ? (process.env.EXPO_PUBLIC_DIRECTUS_URL || 'https://paraiges-directus.neodelta.dev')
  : (Constants.expoConfig?.extra?.directusUrl || process.env.EXPO_PUBLIC_DIRECTUS_URL || 'https://paraiges-directus.neodelta.dev');
```

### Helper pour les images

```typescript
function getDirectusImageUrl(imageId: string | DirectusImage, options?: {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
  quality?: number;
}): string

// Exemple d'URL generee:
// https://paraiges-directus.neodelta.dev/assets/uuid-image?width=300&height=200&fit=cover&quality=80
```

---

## Collections Directus

### Schema relationnel

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    breweries    │     │      beers      │     │     styles      │
│─────────────────│     │─────────────────│     │─────────────────│
│ id              │◄────│ brewery (FK)    │     │ id              │
│ title           │     │ id              │     │ title           │
│ country         │     │ title           │     │ description     │
└─────────────────┘     │ description     │     └────────┬────────┘
                        │ featured_image  │              │
                        │ ibu             │              │
                        └────────┬────────┘              │
                                 │                       │
                                 │    ┌──────────────────┘
                                 │    │
                        ┌────────▼────▼───────┐
                        │    beers_styles     │  (M2M)
                        │─────────────────────│
                        │ beers_id            │
                        │ styles_id           │
                        └─────────────────────┘

┌─────────────────┐     ┌─────────────────────────┐     ┌─────────────────┐
│ establishments  │     │  beers_establishments   │     │      beers      │
│─────────────────│     │─────────────────────────│     │─────────────────│
│ id              │◄────│ establishments_id       │     │ id              │
│ title           │     │ beers_id                │────►│ ...             │
│ ...             │     │ added_time              │     └─────────────────┘
└────────┬────────┘     └─────────────────────────┘
         │
         │              ┌─────────────────────────┐     ┌─────────────────┐
         └──────────────│   news_establishments   │     │      news       │
                        │─────────────────────────│     │─────────────────│
                        │ establishments_id       │     │ id              │
                        │ news_id                 │────►│ title           │
                        └─────────────────────────┘     │ content         │
                                                        │ featured_image  │
                                                        └─────────────────┘

┌─────────────────┐
│ level_thresholds│
│─────────────────│
│ id              │
│ level           │
│ xp_required     │
│ name            │
│ description     │
│ sort_order      │
└─────────────────┘
```

---

## Types TypeScript

### Fichier des types generes
**Emplacement**: `src/shared/types/directus-generated.ts`
**Genere le**: 2025-10-28
**Commande**: `npm run directus:types`

### Collection: `beers`

```typescript
interface Beers {
  id?: number;
  title?: string;              // Nom de la biere
  description?: string;        // Description complete
  featured_image?: string;     // UUID de l'image dans Directus
  brewery?: number;            // FK vers breweries
  ibu?: number;                // International Bitterness Units (amertume)
  style?: number;              // Deprecie - utiliser styles M2M
  available_at?: number[];     // FK array vers establishments
}
```

### Collection: `breweries`

```typescript
interface Breweries {
  id?: number;
  title?: string;              // Nom de la brasserie
  country?: string;            // Pays d'origine
}
```

### Collection: `establishments`

```typescript
interface Establishments {
  id?: number;
  title?: string;              // Nom de l'etablissement
  line_address_1?: string;     // Adresse ligne 1
  line_address_2?: any;        // Adresse ligne 2
  zipcode?: string;            // Code postal
  city?: string;               // Ville
  country?: string;            // Pays
  short_description?: string;  // Description courte
  description?: string;        // Description complete
  featured_image?: string;     // UUID de l'image
  anniversary?: string;        // Date anniversaire
  logo?: string;               // UUID du logo
}
```

### Collection: `news`

```typescript
interface News {
  id?: number;
  title?: string;                      // Titre de l'actualite
  content?: string;                    // Contenu HTML
  featured_image?: string;             // UUID de l'image
  concerned_establishments?: number[]; // FK array vers establishments
}
```

### Collection: `styles`

```typescript
interface Styles {
  id?: number;
  title?: string;              // Nom du style (IPA, Stout, etc.)
  description?: any;           // Description du style
}
```

### Collection: `level_thresholds`

```typescript
interface LevelThresholds {
  id?: number;
  level?: number;              // Numero du niveau (1, 2, 3...)
  xp_required?: number;        // XP minimum pour atteindre ce niveau
  name?: string;               // Nom du niveau ("Apprenti", "Maitre"...)
  description?: string;        // Description du niveau
  sort_order?: number;         // Ordre d'affichage
}
```

### Tables de jonction (Many-to-Many)

```typescript
// Bieres <-> Etablissements
interface BeersEstablishments {
  id?: number;
  beers_id?: any;              // FK vers beers
  establishments_id?: number;  // FK vers establishments
  added_time?: string;         // Heure d'ajout (format HH:mm:ss)
}

// News <-> Etablissements
interface NewsEstablishments {
  id?: number;
  news_id?: number;            // FK vers news
  establishments_id?: number;  // FK vers establishments
}
```

### Schema Directus complet

```typescript
interface DirectusSchema {
  beers: Beers[];
  breweries: Breweries[];
  establishments: Establishments[];
  news: News[];
  quests: Quests[];           // Collection placeholder
  styles: Styles[];
  beers_establishments: BeersEstablishments[];
  news_establishments: NewsEstablishments[];
  level_thresholds: LevelThresholds[];
}
```

---

## Services

### Architecture des services

Chaque collection a un service dedie suivant le pattern singleton:

```
src/features/
├── beers/services/beerService.ts
├── establishments/services/establishmentService.ts
├── news/services/newsService.ts
└── gains/services/levelService.ts
```

### BeerService

**Emplacement**: `src/features/beers/services/beerService.ts`

| Methode | Description |
|---------|-------------|
| `getAll(filters?)` | Recupere toutes les bieres avec filtres optionnels |
| `getById(id)` | Recupere une biere par ID |
| `getByBrewery(breweryId)` | Filtre par brasserie |
| `getByStyle(styleId)` | Filtre par style |
| `getByEstablishment(establishmentId)` | Bieres disponibles dans un etablissement (M2M) |
| `countByEstablishment(establishmentId)` | Compte les bieres d'un etablissement |
| `getByIds(beerIds)` | Recupere plusieurs bieres par IDs |
| `getImageUrl(beer, options?)` | Construit l'URL de l'image |
| `getShortDescription(beer)` | Extrait un resume |
| `formatIBU(beer)` | Formate l'IBU pour affichage |
| `getAllStyles()` | Liste tous les styles |
| `getAllBreweries()` | Liste toutes les brasseries |
| `getAvailableFilterOptions(filters)` | Options de filtres avec compteurs |

**Exemple d'utilisation**:
```typescript
import { beerService } from '@/features/beers/services/beerService';

// Recuperer toutes les bieres
const beers = await beerService.getAll({ limit: 20 });

// Recuperer les bieres d'un etablissement
const beersInBar = await beerService.getByEstablishment(42);

// URL d'image optimisee
const imageUrl = beerService.getImageUrl(beer, { width: 300, height: 200 });
```

### EstablishmentService

**Emplacement**: `src/features/establishments/services/establishmentService.ts`

| Methode | Description |
|---------|-------------|
| `getAll(filters?)` | Recupere tous les etablissements |
| `getById(id)` | Recupere un etablissement par ID |
| `getByCity(city)` | Filtre par ville |
| `getByType(type)` | Filtre par type |
| `getImageUrl(establishment, options?)` | URL de l'image |
| `getFullAddress(establishment)` | Adresse formatee complete |
| `hasCoordinates(establishment)` | Verifie si GPS disponible |

### NewsService

**Emplacement**: `src/features/news/services/newsService.ts`

| Methode | Description |
|---------|-------------|
| `getAll(filters?)` | Recupere toutes les actualites |
| `getById(id)` | Recupere une actualite par ID |
| `getRecent(limit?)` | Actualites recentes |
| `getImageUrl(news, options?)` | URL de l'image |
| `getExcerpt(news)` | Extrait un texte propre du HTML |

### LevelService

**Emplacement**: `src/features/gains/services/levelService.ts`

| Methode | Description |
|---------|-------------|
| `getLevelThresholds()` | Tous les niveaux tries |
| `getCurrentLevel(userXP)` | Calcule le niveau actuel + progression |
| `getLevelById(levelId)` | Niveau par ID |
| `getLevelByNumber(levelNumber)` | Niveau par numero |

**Note**: Toutes les methodes sont `static`.

---

## Patterns de requetes Directus

### Requete simple

```typescript
const beers = await directus.request(
  readItems('beers', {
    sort: ['title'],
    limit: 20,
    offset: 0,
  })
);
```

### Requete avec filtres

```typescript
const beers = await directus.request(
  readItems('beers', {
    filter: {
      brewery: { _eq: 42 },
      ibu: { _gte: 30 },
    },
    sort: ['-id'], // Tri decroissant
    limit: 10,
  })
);
```

### Requete avec relations chargees

```typescript
const beers = await directus.request(
  readItems('beers', {
    fields: [
      '*',                      // Tous les champs de beers
      'brewery.*',              // Relation 1-N : charger la brasserie
      'styles.styles_id.*',     // Relation M2M : charger via junction
    ],
  })
);
```

### Operateurs de filtre disponibles

| Operateur | Description | Exemple |
|-----------|-------------|---------|
| `_eq` | Egal | `{ status: { _eq: 'published' } }` |
| `_neq` | Different | `{ status: { _neq: 'draft' } }` |
| `_in` | Dans la liste | `{ id: { _in: [1, 2, 3] } }` |
| `_nin` | Pas dans la liste | `{ id: { _nin: [1, 2] } }` |
| `_contains` | Contient (texte) | `{ title: { _contains: 'IPA' } }` |
| `_gte` | Superieur ou egal | `{ ibu: { _gte: 50 } }` |
| `_lte` | Inferieur ou egal | `{ ibu: { _lte: 100 } }` |
| `_or` | OU logique | `{ _or: [{ title: ... }, { description: ... }] }` |
| `_and` | ET logique | `{ _and: [{ ... }, { ... }] }` |

### Requete Many-to-Many (via junction table)

```typescript
// Recuperer les bieres d'un etablissement via beers_establishments
const junctionRecords = await directus.request(
  readItems('beers_establishments', {
    filter: {
      establishments_id: { _eq: establishmentId },
    },
    fields: ['beers_id', 'added_time'],
    sort: ['-added_time'], // Plus recent en premier
    limit: -1, // Tous les resultats
  })
);

// Extraire les IDs puis charger les bieres
const beerIds = junctionRecords.map(r => r.beers_id);
const beers = await directus.request(
  readItems('beers', {
    filter: { id: { _in: beerIds } },
    fields: ['*', 'brewery.*'],
  })
);
```

---

## Gestion des images

### Format des images dans Directus

Les images sont stockees dans Directus avec un UUID. Le champ `featured_image` contient cet UUID.

### Construction d'URL optimisee

```typescript
import { getDirectusImageUrl } from '@/core/api';

// Image basique
const url = getDirectusImageUrl('uuid-de-image');
// → https://paraiges-directus.neodelta.dev/assets/uuid-de-image

// Image optimisee
const url = getDirectusImageUrl('uuid-de-image', {
  width: 400,
  height: 300,
  fit: 'cover',
  quality: 80,
});
// → https://paraiges-directus.neodelta.dev/assets/uuid-de-image?width=400&height=300&fit=cover&quality=80
```

### Options de fit

| Option | Description |
|--------|-------------|
| `cover` | Remplit les dimensions en croppant si necessaire |
| `contain` | S'inscrit dans les dimensions sans crop |
| `inside` | Comme contain, ne depasse jamais les dimensions |
| `outside` | Au moins une dimension atteint la valeur demandee |

---

## Generation des types

### Commande

```bash
npm run directus:types
```

### Quand regenerer les types ?

- Apres ajout/modification d'une collection Directus
- Apres modification des champs d'une collection
- Apres ajout de relations

### Fichier de sortie

`src/shared/types/directus-generated.ts`

---

## Variables d'environnement

### .env

```env
EXPO_PUBLIC_DIRECTUS_URL=https://paraiges-directus.neodelta.dev
```

### app.json (extra)

```json
{
  "extra": {
    "directusUrl": "https://paraiges-directus.neodelta.dev"
  }
}
```

---

## Integration Directus / Supabase

### Principe

- **Directus** : Donnees de contenu (bieres, etablissements, news, niveaux)
- **Supabase** : Donnees utilisateurs (profils, likes, receipts, gains)

### Enrichissement des donnees

Exemple avec les likes:

```typescript
// 1. Charger les bieres depuis Directus
const beers = await beerService.getAll();

// 2. Charger les compteurs de likes depuis Supabase
const likeCounts = await likeService.getLikeCounts(beers.map(b => b.id));

// 3. Enrichir les donnees
const enrichedBeers = beers.map(beer => ({
  ...beer,
  likesCount: likeCounts[beer.id] || 0,
}));
```

### Correspondance des IDs

Les `id` Directus sont utilises comme `directus_id` ou `beer_id`/`establishment_id` dans Supabase pour faire le lien.

---

## Ressources

- **Directus Docs**: https://docs.directus.io
- **SDK Directus**: https://docs.directus.io/reference/sdk/
- **Console Directus**: https://paraiges-directus.neodelta.dev/admin

---

**Derniere mise a jour**: 2026-01-20
**Version SDK**: @directus/sdk 20.1.0
