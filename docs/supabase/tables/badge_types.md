# Table: badge_types

Définitions des badges disponibles dans le système.

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 20 (9 classement + 6 mémoire de saison + 5 succès, avril 2026) |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `integer` | Non | nextval | PK |
| `slug` | `character varying(100)` | Non | - | Identifiant unique (ex. `weekly_champion`, `achievement_first_order`) |
| `name` | `character varying(200)` | Non | - | Nom affiché |
| `description` | `text` | Oui | - | Description fonctionnelle |
| `icon` | `character varying(50)` | Oui | - | Emoji ou chemin image |
| `rarity` | `character varying(20)` | Oui | - | `common` / `rare` / `epic` / `legendary` |
| `category` | `character varying(50)` | Oui | - | Voir contraintes ci-dessous |
| `lore` | `text` | Oui | - | Texte narratif immersif |
| `criterion_type` | `character varying(50)` | Oui | NULL | **Achievement uniquement** : type de critère de déblocage. `first_order`, `orders_threshold`, `cities_visited`, `all_establishments_visited`, `establishments_threshold`, `consecutive_weekly_quests`. NULL pour les autres catégories. |
| `criterion_params` | `jsonb` | Non | `{}` | **Achievement uniquement** : paramètres du critère (ex: `{"threshold":10}`, `{"n_weeks":4}`, `{"min_cities":2}`). Schéma dépendant de `criterion_type`. |
| `evaluation_mode` | `character varying(20)` | Non | `'cron'` | **Achievement uniquement** : `realtime` (hook `create_receipt`) ou `cron` (batch nocturne à 02:00 UTC). |
| `archived_at` | `timestamptz` | Oui | NULL | **Soft-delete** : un badge archivé n'est plus attribué mais reste visible pour les `user_badges` déjà obtenus. |
| `created_at` | `timestamp with time zone` | Oui | now() | - |

## Contraintes CHECK

- `rarity` ∈ `{common, rare, epic, legendary}`
- `category` ∈ `{weekly, monthly, yearly, special, season_rank, quest, achievement}` *(étendu avril 2026 — migration `022_achievement_badges_schema.sql`)*
- `evaluation_mode` ∈ `{realtime, cron}`

## Catalogue actuel (avril 2026)

### Catégorie `weekly` (3 badges classement)
- `weekly_champion` 🥇 (epic), `weekly_podium_2_3` 🥈 (rare), `weekly_top_10` 🏅 (common)

### Catégorie `monthly` (3 badges classement)
- `monthly_champion` 👑 (epic), `monthly_podium_2_3` 🏆 (rare), `monthly_top_10` ⭐ (common)

### Catégorie `yearly` (3 badges classement)
- `yearly_champion` 💎 (legendary), `yearly_podium_2_3` 🌟 (epic), `yearly_top_10` ✨ (rare)

### Catégorie `season_rank` — « mémoire de saison » (6 badges)

Attribués automatiquement à chaque Compagnon au moment du reset annuel via `award_season_rank_badges(year)`.

| Slug | Nom | Rareté | Icon |
|---|---|---|---|
| `season_rank_ecuyer` | Écuyer de la saison | common | 🛡️ |
| `season_rank_soldat` | Soldat de la saison | common | ⚔️ |
| `season_rank_sergent` | Sergent de la saison | rare | 🎖️ |
| `season_rank_capitaine` | Capitaine de la saison | epic | 🏛️ |
| `season_rank_chevalier` | Chevalier de la saison | epic | ⚜️ |
| `season_rank_chevalier_table_ronde` | Chevalier de la Table Ronde de la saison | legendary | 🍻 |

### Catégorie `achievement` — « badges succès » (5 badges, avril 2026)

Débloqués automatiquement quand un joueur remplit un critère (migration `025_achievement_badges_seed.sql`). Attribution idempotente via `award_achievements_for_user()`. Cf. `functions/achievement_badges.md`.

| Slug | Nom | Rareté | Icon | Critère | Mode |
|---|---|---|---|---|---|
| `achievement_first_order` | Premier pas | common | 🥾 | `first_order` | realtime |
| `achievement_orders_10` | Habitué | common | 🍺 | `orders_threshold` (10) | realtime |
| `achievement_orders_50` | Fidèle | rare | 🏵️ | `orders_threshold` (50) | realtime |
| `achievement_cities_2` | Explorateur | rare | 🗺️ | `cities_visited` (2) | realtime |
| `achievement_consecutive_weekly_quests_4` | Maître d'arme | epic | ⚔️ | `consecutive_weekly_quests` (4) | cron |

### Catégorie `quest`

Aucun badge créé pour l'instant. Catégorie autorisée pour préparer l'attribution de badges aux quêtes (cf. `animation/03-gamification/badges.md`).

### Catégorie `special`

Aucun badge créé pour l'instant. Réservée aux jalons narratifs / événementiels manuels (la catégorie `achievement` est utilisée pour les déblocages automatiques).

## Clés primaires

- `id`

## Index

- UNIQUE sur `slug`

## Tables liées

- `user_badges (badge_id)` → `badge_types (id)` — référence d'attribution
- `reward_tiers (badge_type_id)` → `badge_types (id)` — palier classement

## Relations (Foreign Keys)

Aucune FK sortante.
