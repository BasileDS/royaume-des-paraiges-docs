# Documentation Supabase - Royaume des Paraiges

## Informations Projet

| Propriete | Valeur |
|-----------|--------|
| **Project ID** | `uflgfsoekkgegdgecubb` |
| **Region** | us-east-2 |
| **URL API** | `https://uflgfsoekkgegdgecubb.supabase.co` |

## Vue d'ensemble

Cette documentation decrit la configuration complete de la base de donnees Supabase pour l'application Royaume des Paraiges.

## Structure de la Documentation

```
supabase/docs/
├── SUPABASE-CONFIG.md           # Ce fichier
├── tables/                      # Structure des tables
│   ├── README.md               # Vue d'ensemble des tables
│   ├── available_periods.md
│   ├── badge_types.md
│   ├── comments.md
│   ├── constants.md
│   ├── coupon_distribution_logs.md
│   ├── coupon_templates.md
│   ├── coupons.md
│   ├── gains.md
│   ├── leaderboard_reward_distributions.md
│   ├── likes.md
│   ├── notes.md
│   ├── period_closures.md
│   ├── period_reward_configs.md
│   ├── profiles.md
│   ├── quest_completion_logs.md
│   ├── quest_periods.md
│   ├── quest_progress.md
│   ├── quests.md
│   ├── receipt_lines.md
│   ├── receipts.md
│   ├── reward_tiers.md
│   ├── spendings.md
│   ├── user_badges.md
├── functions/                   # Fonctions PostgreSQL
│   ├── README.md               # Index des fonctions
│   └── ...
├── triggers/                    # Triggers
│   └── README.md
├── policies/                    # Politiques RLS
│   └── README.md
├── views/                       # Vues et vues materialisees
│   └── README.md
├── storage/                     # Buckets et policies storage
│   └── README.md
└── edge-functions/             # Edge Functions
    └── README.md
```

## Resume de la Base de Donnees

### Tables (23)

| Table | Lignes | RLS | Description |
|-------|--------|-----|-------------|
| `available_periods` | 130 | Oui | - |
| `badge_types` | -1 | Oui | Définitions des badges disponibles dans le système |
| `comments` | -1 | Oui | - |
| `constants` | -1 | Oui | - |
| `coupon_distribution_logs` | -1 | Oui | Historique complet de toutes les distributions de coupons |
| `coupon_templates` | -1 | Oui | Modèles de coupons réutilisables pour les récompenses |
| `coupons` | 4 | Oui | - |
| `gains` | 42 | Oui | - |
| `leaderboard_reward_distributions` | -1 | Oui | Historique des récompenses distribuées aux gagnants du leaderboard |
| `likes` | 0 | Oui | - |
| `notes` | -1 | Oui | - |
| `period_closures` | -1 | Oui | Tracking des périodes de leaderboard fermées et récompenses distribuées |
| `period_reward_configs` | -1 | Oui | Configuration personnalisée des récompenses pour une période spécifique |
| `profiles` | 18 | Oui | - |
| `quest_completion_logs` | -1 | Oui | Historique detaille de toutes les completions de quetes avec recompenses |
| `quest_periods` | 0 | Oui | Table de liaison pour assigner des quêtes à des périodes spécifiques (ex: 2026-W05, 2026-01, 2026) |
| `quest_progress` | -1 | Oui | Suivi de la progression des utilisateurs sur les quetes |
| `quests` | -1 | Oui | Definition des quetes periodiques disponibles |
| `receipt_lines` | 42 | Oui | - |
| `receipts` | 42 | Oui | - |
| `reward_tiers` | -1 | Oui | Paliers de récompenses pour le leaderboard (configurable par rang) |
| `spendings` | -1 | Oui | - |
| `user_badges` | -1 | Oui | Collection des badges obtenus par chaque utilisateur |

### Types Personnalises (Enums)

| Enum | Valeurs |
|------|---------|
| `payment_method` | {card,cash,cashback,coupon} |
| `user_role` | {client,employee,establishment,admin} |

### Fonctions (36)

Fonctions principales :
- `award_user_badge` - Attribue un badge à un utilisateur pour une période donnée
- `calculate_gains` - Pas de description
- `calculate_quest_progress` - Calcule la progression actuelle d'un utilisateur pour une quete donnee
- `check_cashback_balance` - Pas de description
- `check_email_exists` - Pas de description
- `check_period_closed` - Vérifie si une période de leaderboard a déjà été fermée
- `create_frequency_coupon` - Crée automatiquement un coupon de 5% de réduction pour un utilisateur qui a passé au moins 10 commandes durant la semaine actuelle (lundi-dimanche). Un seul coupon par semaine est autorisé.
- `create_leaderboard_reward_coupon` - Crée un coupon de récompense leaderboard (montant OU pourcentage)
- `create_manual_coupon` - Pas de description
- `create_receipt` - Crée un reçu avec paiements, coupons et gains. Applique les coefficients XP et cashback du profil client (100 = 1x, 150 = 1.5x, 50 = 0.5x).

... et 26 autres fonctions

### Triggers (2)

| Trigger | Table | Description |
|---------|-------|-------------|
| `trigger_create_spending_on_cashback` | `receipt_lines` | Appelle `create_spending_from_cashback_payment` |
| `trigger_quest_progress_on_receipt` | `receipts` | Appelle `trigger_update_quest_progress` |

### Jobs pg_cron (3)

| Job | Cron | Description |
|-----|------|-------------|
| Job 1 | `5 0 * * 1` | `SELECT distribute_period_rewards_v2('weekly')` |
| Job 2 | `10 0 1 * *` | `SELECT distribute_period_rewards_v2('monthly')` |
| Job 3 | `15 0 1 1 *` | `SELECT distribute_period_rewards_v2('yearly')` |

### Vues Materialisees (4)

- `monthly_xp_leaderboard` - Leaderboard mensuel (1er au dernier jour du mois). Joindre avec profiles pour récupérer username, nom, etc.
- `user_stats` - Vue matérialisée combinant les statistiques XP et cashback par utilisateur
- `weekly_xp_leaderboard` - Leaderboard hebdomadaire (lundi-dimanche). Joindre avec profiles pour récupérer username, nom, etc.
- `yearly_xp_leaderboard` - Leaderboard annuel (1er janvier au 31 décembre). Joindre avec profiles pour récupérer username, nom, etc.

### Vues (1)

- `reward_distribution_stats` - Pas de description

### Storage Buckets (1)

- `avatars` - Photos de profil (public)

### Edge Functions (1)

- `send-contact-email` - send-contact-email (JWT: Oui)

## Extensions Installees

| Extension | Schema | Version | Description |
|-----------|--------|---------|-------------|
| `pg_cron` | pg_catalog | 1.6.4 | Job scheduler for PostgreSQL |
| `pg_graphql` | graphql | 1.5.11 | pg_graphql: GraphQL support |
| `pg_stat_statements` | extensions | 1.11 | track planning and execution statistics of all SQL statements executed |
| `pgcrypto` | extensions | 1.3 | cryptographic functions |
| `plpgsql` | pg_catalog | 1.0 | PL/pgSQL procedural language |
| `supabase_vault` | vault | 0.3.1 | Supabase Vault Extension |
| `uuid-ossp` | extensions | 1.1 | generate universally unique identifiers (UUIDs) |

## Schema Relationnel

```
auth.users
    │
    └──► profiles (id = auth.uid())
            │
            ├──► likes (user_id)
            ├──► comments (customer_id)
            ├──► notes (customer_id)
            ├──► coupons (customer_id)
            ├──► user_badges (customer_id)
            ├──► leaderboard_reward_distributions (customer_id)
            ├──► spendings (customer_id)
            ├──► coupon_distribution_logs (customer_id, distributed_by)
            ├──► coupon_templates (created_by)
            ├──► period_reward_configs (distributed_by)
            │
            └──► receipts (customer_id)
                    │
                    ├──► receipt_lines (receipt_id)
                    ├──► gains (receipt_id)
                    └──► spendings (receipt_id)

badge_types ──► user_badges (badge_id)
            └──► reward_tiers (badge_type_id)

coupons ◄── leaderboard_reward_distributions (coupon_amount_id, coupon_percentage_id)
        ◄── coupon_distribution_logs (coupon_id)

coupon_templates ──► coupons (template_id)
                 └──► reward_tiers (coupon_template_id)
                 └──► coupon_distribution_logs (coupon_template_id)

reward_tiers ──► coupon_distribution_logs (tier_id)
```

## Derniere mise a jour

- **Date** : 2026-01-21
- **Generee automatiquement** par `scripts/sync-supabase-docs.mjs`
