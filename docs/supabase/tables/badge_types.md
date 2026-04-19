# Table: badge_types

Définitions des badges disponibles dans le système.

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 15 (9 classement + 6 mémoire de saison, avril 2026) |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `integer` | Non | nextval | PK |
| `slug` | `character varying(100)` | Non | - | Identifiant unique (ex. `weekly_champion`, `season_rank_chevalier`) |
| `name` | `character varying(200)` | Non | - | Nom affiché |
| `description` | `text` | Oui | - | Description fonctionnelle |
| `icon` | `character varying(50)` | Oui | - | Emoji ou chemin image |
| `rarity` | `character varying(20)` | Oui | - | `common` / `rare` / `epic` / `legendary` |
| `category` | `character varying(50)` | Oui | - | Voir contraintes ci-dessous |
| `lore` | `text` | Oui | - | Texte narratif immersif (rédigé pour les 15 badges) |
| `created_at` | `timestamp with time zone` | Oui | now() | - |

## Contraintes CHECK

- `rarity` ∈ `{common, rare, epic, legendary}`
- `category` ∈ `{weekly, monthly, yearly, special, season_rank, quest}` *(étendu en avril 2026 — migration `008_season_badges_seeds.sql`)*

## Catalogue actuel (avril 2026)

### Catégorie `weekly` (3 badges classement)
- `weekly_champion` 🥇 (epic), `weekly_podium_2_3` 🥈 (rare), `weekly_top_10` 🏅 (common)

### Catégorie `monthly` (3 badges classement)
- `monthly_champion` 👑 (epic), `monthly_podium_2_3` 🏆 (rare), `monthly_top_10` ⭐ (common)

### Catégorie `yearly` (3 badges classement)
- `yearly_champion` 💎 (legendary), `yearly_podium_2_3` 🌟 (epic), `yearly_top_10` ✨ (rare)

### Catégorie `season_rank` — « mémoire de saison » (6 badges)

Attribués automatiquement à chaque Compagnon au moment du reset annuel via `award_season_rank_badges(year)`. L'année est portée par `user_badges.period_identifier` (ex. « 2026 »).

| Slug | Nom | Rareté | Icon |
|---|---|---|---|
| `season_rank_ecuyer` | Écuyer de la saison | common | 🛡️ |
| `season_rank_soldat` | Soldat de la saison | common | ⚔️ |
| `season_rank_sergent` | Sergent de la saison | rare | 🎖️ |
| `season_rank_capitaine` | Capitaine de la saison | epic | 🏛️ |
| `season_rank_chevalier` | Chevalier de la saison | epic | ⚜️ |
| `season_rank_chevalier_table_ronde` | Chevalier de la Table Ronde de la saison | legendary | 🍻 |

### Catégorie `quest`

Aucun badge créé pour l'instant. Catégorie autorisée pour préparer l'attribution de badges aux quêtes (cf. `animation/03-gamification/badges.md`).

### Catégorie `special`

Aucun badge créé pour l'instant. Réservée aux jalons narratifs / événementiels.

## Clés primaires

- `id`

## Index

- UNIQUE sur `slug`

## Tables liées

- `user_badges (badge_id)` → `badge_types (id)` — référence d'attribution
- `reward_tiers (badge_type_id)` → `badge_types (id)` — palier classement

## Relations (Foreign Keys)

Aucune FK sortante.
