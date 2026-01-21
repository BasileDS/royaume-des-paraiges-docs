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
│   ├── profiles.md
│   ├── receipts.md
│   ├── receipt_lines.md
│   ├── gains.md
│   ├── spendings.md
│   ├── coupons.md
│   ├── coupon_templates.md
│   ├── reward_tiers.md
│   ├── period_reward_configs.md
│   ├── coupon_distribution_logs.md
│   ├── likes.md
│   ├── comments.md
│   ├── notes.md
│   ├── badge_types.md
│   ├── user_badges.md
│   ├── leaderboard_reward_distributions.md
│   ├── period_closures.md
│   ├── constants.md
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

### Tables (18)

| Table | Lignes | RLS | Description |
|-------|--------|-----|-------------|
| `profiles` | 17 | Oui | Profils utilisateurs lies a auth.users |
| `receipts` | 55 | Oui | Tickets de caisse |
| `receipt_lines` | 55 | Oui | Lignes de paiement des tickets |
| `gains` | 55 | Oui | XP et cashback gagnes |
| `spendings` | 5 | Oui | Depenses cashback |
| `coupons` | 2 | Oui | Coupons de reduction utilisateurs |
| `coupon_templates` | 23 | Oui | Modeles de coupons reutilisables |
| `reward_tiers` | 6 | Oui | Paliers de recompenses leaderboard |
| `period_reward_configs` | 0 | Oui | Config personnalisee par periode |
| `coupon_distribution_logs` | 2 | Oui | Historique des distributions |
| `likes` | 8 | Oui | Likes sur contenus |
| `comments` | 2 | Oui | Commentaires |
| `notes` | 0 | Oui | Notes/evaluations |
| `badge_types` | 9 | Oui | Definitions des badges |
| `user_badges` | 2 | Oui | Badges obtenus par utilisateur |
| `leaderboard_reward_distributions` | 0 | Oui | Historique recompenses leaderboard |
| `period_closures` | 1 | Oui | Clotures de periodes |
| `constants` | 2 | Oui | Constantes de configuration |

### Types Personnalises (Enums)

| Enum | Valeurs |
|------|---------|
| `user_role` | `client`, `employee`, `establishment`, `admin` |
| `payment_method` | `card`, `cash`, `cashback`, `coupon` |

### Fonctions (29)

Fonctions principales :
- `award_user_badge` - Attribue un badge a un utilisateur pour une periode donnee
- `calculate_gains` - Calcule les gains XP et cashback
- `check_cashback_balance` - Verifie le solde cashback d'un utilisateur
- `check_email_exists` - Verifie si un email existe
- `check_period_closed` - Verifie si une periode de leaderboard a deja ete fermee
- `create_frequency_coupon` - Cree un coupon de frequence (5% si 10+ commandes/semaine)
- `create_leaderboard_reward_coupon` - Cree un coupon de recompense leaderboard
- `create_manual_coupon` - Cree un coupon manuellement
- `create_receipt` - Cree un recu avec paiements, coupons et gains
- `create_spending_from_cashback_payment` - Trigger: cree un spending lors d'un paiement cashback

... et 19 autres fonctions

### Triggers (1)

| Trigger | Table | Description |
|---------|-------|-------------|
| `trigger_create_spending_on_cashback` | `receipt_lines` | Appelle `create_spending_from_cashback_payment` |

### Jobs pg_cron (3)

| Job | Cron | Description |
|-----|------|-------------|
| Job 1 | `5 0 * * 1` | `SELECT distribute_period_rewards_v2('weekly')` |
| Job 2 | `10 0 1 * *` | `SELECT distribute_period_rewards_v2('monthly')` |
| Job 3 | `15 0 1 1 *` | `SELECT distribute_period_rewards_v2('yearly')` |

### Vues Materialisees (4)

- `user_stats` - Statistiques XP et cashback par utilisateur
- `weekly_xp_leaderboard` - Classement hebdomadaire (lundi-dimanche)
- `monthly_xp_leaderboard` - Classement mensuel (1er au dernier jour)
- `yearly_xp_leaderboard` - Classement annuel (1er janvier au 31 decembre)

### Vues (1)

- `reward_distribution_stats` - Statistiques des distributions de recompenses

### Storage Buckets (1)

- `avatars` - Photos de profil (public)

### Edge Functions (1)

- `send-contact-email` - send-contact-email (JWT: Oui)

## Extensions Installees

| Extension | Schema | Version | Description |
|-----------|--------|---------|-------------|
| `plpgsql` | pg_catalog | 1.0 | PL/pgSQL procedural language |
| `uuid-ossp` | extensions | 1.1 | Generation UUIDs |
| `pgcrypto` | extensions | 1.3 | Fonctions cryptographiques |
| `pg_graphql` | graphql | 1.5.11 | Support GraphQL |
| `pg_stat_statements` | extensions | 1.11 | Statistiques SQL |
| `supabase_vault` | vault | 0.3.1 | Vault Supabase |
| `pg_cron` | pg_catalog | 1.6.4 | Jobs cron PostgreSQL |

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
