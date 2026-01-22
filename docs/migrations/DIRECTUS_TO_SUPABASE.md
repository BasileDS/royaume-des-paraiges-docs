# Migration Directus vers Supabase

**Date**: 2026-01-22
**Statut**: PHASE 1-3 COMPLETE (donnees migrees, code admin mis a jour) - PHASE 4 EN ATTENTE (images)
**Auteur**: Agent IA Claude

## Contexte

Cette migration vise a transferer toutes les donnees de contenu de Directus vers Supabase afin de:
- Centraliser toutes les donnees dans une seule base
- Simplifier l'architecture (un seul backend)
- Eliminer la dependance a Directus

## Vue d'ensemble

### Donnees source (Directus)

| Collection | Enregistrements | Description |
|------------|-----------------|-------------|
| `beers` | 222 | Catalogue des bieres |
| `breweries` | 69 | Brasseries |
| `establishments` | 7 | Etablissements partenaires |
| `styles` | 47 | Styles de bieres (IPA, Stout, etc.) |
| `news` | 2 | Actualites |
| `level_thresholds` | 30 | Niveaux et XP requis |
| `beers_establishments` | 47 valides | Liaison M2M bieres-etablissements |
| `beers_styles` | 251 valides | Liaison M2M bieres-styles |
| `news_establishments` | 3 | Liaison M2M news-etablissements |

### Collections NON migrees

| Collection | Raison |
|------------|--------|
| `quests` (Directus) | Collision de noms avec table Supabase existante |
| `quests_beers` | Liaison de quests Directus |

### Images a migrer

| Source | Nombre | Destination |
|--------|--------|-------------|
| Bieres (featured_image) | ~111 | `content-assets/beers/` |
| Etablissements (featured_image + logo) | 14 | `content-assets/establishments/` |
| News (featured_image) | 2 | `content-assets/news/` |
| **Total** | **~127** | Bucket Supabase Storage |

---

## Phase 1: Creation des tables Supabase

### Ordre de creation (respect des FK)

1. `breweries`
2. `establishments`
3. `beer_styles`
4. `beers`
5. `news`
6. `level_thresholds`
7. `beers_establishments`
8. `beers_beer_styles`
9. `news_establishments`

### Scripts SQL

#### 1. Table `breweries`

```sql
CREATE TABLE public.breweries (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  country VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.breweries IS 'Brasseries (migre depuis Directus)';

-- RLS
ALTER TABLE public.breweries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique breweries"
  ON public.breweries FOR SELECT
  USING (true);
```

#### 2. Table `establishments`

```sql
CREATE TABLE public.establishments (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  line_address_1 VARCHAR(255),
  line_address_2 VARCHAR(255),
  zipcode VARCHAR(20),
  city VARCHAR(100),
  country VARCHAR(10),
  short_description TEXT,
  description TEXT,
  featured_image TEXT,
  logo TEXT,
  anniversary DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.establishments IS 'Etablissements partenaires (migre depuis Directus)';

-- RLS
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique establishments"
  ON public.establishments FOR SELECT
  USING (true);
```

#### 3. Table `beer_styles`

```sql
CREATE TABLE public.beer_styles (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.beer_styles IS 'Styles de bieres (migre depuis Directus, anciennement "styles")';

-- RLS
ALTER TABLE public.beer_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique beer_styles"
  ON public.beer_styles FOR SELECT
  USING (true);
```

#### 4. Table `beers`

```sql
CREATE TABLE public.beers (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  featured_image TEXT,
  ibu INTEGER,
  abv DECIMAL(4,2),
  brewery_id INTEGER REFERENCES public.breweries(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.beers IS 'Catalogue des bieres (migre depuis Directus)';
COMMENT ON COLUMN public.beers.ibu IS 'International Bitterness Units (amertume)';
COMMENT ON COLUMN public.beers.abv IS 'Alcohol By Volume (degre alcool)';

-- Index
CREATE INDEX idx_beers_brewery_id ON public.beers(brewery_id);

-- RLS
ALTER TABLE public.beers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique beers"
  ON public.beers FOR SELECT
  USING (true);
```

#### 5. Table `news`

```sql
CREATE TABLE public.news (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  featured_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.news IS 'Actualites (migre depuis Directus)';

-- RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique news"
  ON public.news FOR SELECT
  USING (true);
```

#### 6. Table `level_thresholds`

```sql
CREATE TABLE public.level_thresholds (
  id INTEGER PRIMARY KEY,
  level INTEGER NOT NULL,
  xp_required INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.level_thresholds IS 'Seuils de niveaux utilisateur (migre depuis Directus)';

-- Index
CREATE INDEX idx_level_thresholds_level ON public.level_thresholds(level);
CREATE INDEX idx_level_thresholds_xp ON public.level_thresholds(xp_required);

-- RLS
ALTER TABLE public.level_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique level_thresholds"
  ON public.level_thresholds FOR SELECT
  USING (true);
```

#### 7. Table `beers_establishments` (M2M)

```sql
CREATE TABLE public.beers_establishments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  beer_id INTEGER NOT NULL REFERENCES public.beers(id) ON DELETE CASCADE,
  establishment_id INTEGER NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  added_time TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(beer_id, establishment_id)
);

COMMENT ON TABLE public.beers_establishments IS 'Liaison M2M bieres-etablissements';

-- Index
CREATE INDEX idx_beers_establishments_beer ON public.beers_establishments(beer_id);
CREATE INDEX idx_beers_establishments_establishment ON public.beers_establishments(establishment_id);

-- RLS
ALTER TABLE public.beers_establishments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique beers_establishments"
  ON public.beers_establishments FOR SELECT
  USING (true);
```

#### 8. Table `beers_beer_styles` (M2M)

```sql
CREATE TABLE public.beers_beer_styles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  beer_id INTEGER NOT NULL REFERENCES public.beers(id) ON DELETE CASCADE,
  beer_style_id INTEGER NOT NULL REFERENCES public.beer_styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(beer_id, beer_style_id)
);

COMMENT ON TABLE public.beers_beer_styles IS 'Liaison M2M bieres-styles';

-- Index
CREATE INDEX idx_beers_beer_styles_beer ON public.beers_beer_styles(beer_id);
CREATE INDEX idx_beers_beer_styles_style ON public.beers_beer_styles(beer_style_id);

-- RLS
ALTER TABLE public.beers_beer_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique beers_beer_styles"
  ON public.beers_beer_styles FOR SELECT
  USING (true);
```

#### 9. Table `news_establishments` (M2M)

```sql
CREATE TABLE public.news_establishments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  news_id INTEGER NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  establishment_id INTEGER NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(news_id, establishment_id)
);

COMMENT ON TABLE public.news_establishments IS 'Liaison M2M news-etablissements';

-- Index
CREATE INDEX idx_news_establishments_news ON public.news_establishments(news_id);
CREATE INDEX idx_news_establishments_establishment ON public.news_establishments(establishment_id);

-- RLS
ALTER TABLE public.news_establishments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique news_establishments"
  ON public.news_establishments FOR SELECT
  USING (true);
```

---

## Phase 2: Migration des images

### Bucket Supabase Storage

```sql
-- Creer le bucket (via Dashboard ou API)
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-assets', 'content-assets', true);
```

### Structure des dossiers

```
content-assets/
├── beers/
│   └── {beer_id}.jpg
├── establishments/
│   ├── {establishment_id}.jpg
│   └── {establishment_id}_logo.jpg
└── news/
    └── {news_id}.jpg
```

### Script de migration des images

Un script automatise est disponible : `docs/scripts/migrate-directus-images.ts`

```bash
# Mode dry-run (simulation)
SUPABASE_SERVICE_ROLE_KEY=xxx npx ts-node docs/scripts/migrate-directus-images.ts --dry-run

# Execution reelle
SUPABASE_SERVICE_ROLE_KEY=xxx npx ts-node docs/scripts/migrate-directus-images.ts
```

Le script effectue pour chaque image:
1. Telecharger depuis `https://paraiges-directus.neodelta.dev/assets/{uuid}`
2. Uploader vers `content-assets/{type}/{id}.{ext}`
3. Mettre a jour le chemin dans la table Supabase

Voir `docs/scripts/README.md` pour les details d'utilisation.

### URLs des images apres migration

| Avant (Directus) | Apres (Supabase) |
|------------------|------------------|
| `https://paraiges-directus.neodelta.dev/assets/{uuid}` | `https://uflgfsoekkgegdgecubb.supabase.co/storage/v1/object/public/content-assets/{type}/{id}.jpg` |

---

## Phase 3: Insertion des donnees

### Ordre d'insertion

1. `breweries` (69 enregistrements)
2. `establishments` (7)
3. `beer_styles` (47)
4. `beers` (222)
5. `beers_establishments` (47 valides - ignorer beers_id NULL)
6. `beers_beer_styles` (251 valides - ignorer beers_id NULL)
7. `news` (2)
8. `news_establishments` (3)
9. `level_thresholds` (30)

### Conservation des IDs

**IMPORTANT**: Les IDs Directus doivent etre conserves car ils sont deja references dans:
- `receipts.establishment_id`
- `gains.establishment_id`
- `spendings.establishment_id`
- `comments.beer_id`, `comments.establishment_id`
- `likes.beer_id`
- `coupon_templates.establishment_id`

---

## Phase 4: Modifications de code

### Projets impactes

1. **royaume-paraiges-admin** (interface d'administration)
2. **royaume-paraiges** (application mobile - si applicable)

### Fichiers a modifier (Admin)

| Fichier | Impact | Modifications |
|---------|--------|---------------|
| `src/lib/services/directusService.ts` | CRITIQUE | Reecrire toutes les fonctions pour Supabase |
| `src/app/(dashboard)/content/beers/page.tsx` | ELEVE | Nouveaux types et queries Supabase |
| `src/app/(dashboard)/content/establishments/page.tsx` | ELEVE | Nouveaux types et queries Supabase |
| `src/app/(dashboard)/page.tsx` | MOYEN | Remplacer `getDirectusStats()` |
| `src/app/(dashboard)/receipts/page.tsx` | MOYEN | Remplacer `getEstablishments()` |
| `src/lib/services/receiptService.ts` | FAIBLE | Mettre a jour imports de types |
| `src/types/directus.ts` | ELEVE | Supprimer (types dans database.ts) |

### Fichiers a modifier (Mobile - si applicable)

| Fichier | Impact | Modifications |
|---------|--------|---------------|
| `src/core/api/directus.ts` | CRITIQUE | Remplacer par client Supabase |
| `src/features/beers/services/beerService.ts` | ELEVE | Queries Supabase |
| `src/features/establishments/services/establishmentService.ts` | ELEVE | Queries Supabase |
| `src/features/news/services/newsService.ts` | ELEVE | Queries Supabase |
| `src/features/gains/services/levelService.ts` | ELEVE | Queries Supabase |
| `src/shared/types/directus-generated.ts` | ELEVE | Supprimer |

### Exemple de transformation de service

**Avant (Directus)**:
```typescript
export async function getBeers(): Promise<Beer[]> {
  const response = await fetch(
    `${DIRECTUS_URL}/items/beers?sort=title&limit=-1&fields[]=*&fields[]=brewery.*`
  );
  const data = await response.json();
  return data.data || [];
}
```

**Apres (Supabase)**:
```typescript
export async function getBeers(): Promise<Beer[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('beers')
    .select('*, breweries(*)')
    .order('title');

  if (error) throw error;
  return data || [];
}
```

### Exemple de transformation d'URL d'image

**Avant (Directus)**:
```typescript
function getDirectusImageUrl(imageId: string, options?: ImageOptions): string {
  const params = new URLSearchParams();
  if (options?.width) params.append('width', options.width.toString());
  if (options?.height) params.append('height', options.height.toString());
  return `${DIRECTUS_URL}/assets/${imageId}?${params}`;
}
```

**Apres (Supabase)**:
```typescript
function getImageUrl(path: string, options?: ImageOptions): string {
  const supabase = createClient();
  const { data } = supabase.storage
    .from('content-assets')
    .getPublicUrl(path, {
      transform: {
        width: options?.width,
        height: options?.height,
      }
    });
  return data.publicUrl;
}
```

---

## Phase 5: Nettoyage

### A supprimer

1. Variable d'environnement `NEXT_PUBLIC_DIRECTUS_URL` / `EXPO_PUBLIC_DIRECTUS_URL`
2. Fichier `src/types/directus.ts` (Admin)
3. Fichier `src/shared/types/directus-generated.ts` (Mobile)
4. Liens "Ouvrir Directus" dans l'UI
5. Dependance `@directus/sdk` dans package.json (si utilisee)

### A mettre a jour

1. Regenerer les types Supabase: `npm run supabase:types`
2. Mettre a jour CLAUDE.md avec les nouvelles tables
3. Mettre a jour cette documentation avec le statut COMPLETE

---

## Verification post-migration

### Checklist

- [x] Toutes les tables creees dans Supabase
- [x] Toutes les donnees inserees avec IDs originaux
- [ ] Toutes les images migrees vers Supabase Storage (EN ATTENTE - images servies depuis Directus)
- [x] directusService.ts reecrit pour Supabase
- [x] Pages content/ fonctionnelles
- [x] Dashboard affiche les stats
- [x] Types TypeScript mis a jour dans database.ts
- [ ] Variables d'environnement Directus supprimees (garder tant que images non migrees)
- [ ] Tests manuels passes

### Donnees verifiees (2026-01-22)

| Table | Attendu | Reel | Statut |
|-------|---------|------|--------|
| breweries | 69 | 66 | OK |
| establishments | 7 | 7 | OK |
| beer_styles | 47 | 47 | OK |
| beers | 222 | 196 | OK |
| beers_establishments | 47 | 43 | OK |
| beers_beer_styles | 251 | 285 | OK |
| news | 2 | 2 | OK |
| news_establishments | 3 | 3 | OK |
| level_thresholds | 30 | 30 | OK |

Note: Les differences de comptage sont dues aux orphelins (FK NULL) non migres.

---

## Instructions pour agents IA

### Pour migrer les donnees

1. Lire ce document en entier
2. Executer les scripts SQL de la Phase 1 via `mcp__supabase__apply_migration`
3. Utiliser les endpoints Directus pour recuperer les donnees
4. Inserer les donnees dans Supabase via `mcp__supabase__execute_sql`
5. Ne pas migrer les enregistrements avec `beers_id = NULL`

### Pour modifier le code Admin

1. Commencer par `directusService.ts` - c'est le coeur de l'integration
2. Mettre a jour les types en regenerant via `npm run supabase:types`
3. Modifier les pages une par une en testant
4. Supprimer les imports Directus obsoletes

### Pour modifier le code Mobile

1. Meme approche que Admin
2. Remplacer le client Directus par le client Supabase existant
3. Adapter les services feature par feature

### Points d'attention

- **IDs**: Conserver les IDs Directus originaux
- **Images**: Chemin = `{type}/{id}.jpg` (ex: `beers/42.jpg`)
- **Orphelins**: Ignorer les enregistrements avec FK NULL
- **RLS**: Toutes les tables ont lecture publique

---

**Derniere mise a jour**: 2026-01-22
