# Documentation Supabase

## Introduction

Cette section documente l'utilisation de Supabase comme backend pour le Royaume des Paraiges.

**Project ID**: `uflgfsoekkgegdgecubb`
**URL API**: `https://uflgfsoekkgegdgecubb.supabase.co`
**Region**: us-east-2
**PostgreSQL**: 17.6.1.003

## Table des matieres

- [Configuration complete](./configuration.md) - Schema, tables, fonctions, triggers

## Resume

- **32 tables** public avec RLS active
- **38 fonctions** PostgreSQL
- **4 vues materialisees** (leaderboards, stats)
- **3 triggers** automatiques
- **3 jobs pg_cron** pour distributions automatiques
- **2 buckets storage** (avatars, content-assets)
- **1 edge function** (send-contact-email)
- **3 enums** personnalises (payment_method, quest_type, user_role)

## Tables par Categorie

### Utilisateurs & Auth
- `profiles` - Profils utilisateurs (17 lignes)
- `user_badges` - Badges obtenus (2 lignes)

### Coupons & Recompenses
- `coupons` - Coupons utilisateurs (2 lignes)
- `coupon_templates` - Modeles de coupons (23 lignes)
- `coupon_distribution_logs` - Historique distributions
- `reward_tiers` - Paliers de recompenses (6 lignes)

### Quetes
- `quests` - Definition des quetes (3 lignes)
- `quest_progress` - Progression utilisateurs (3 lignes)
- `quest_completion_logs` - Historique completions (2 lignes)
- `quest_periods` - Liaison quetes-periodes (5 lignes)
- `available_periods` - Periodes disponibles (130 lignes)

### Leaderboard
- `leaderboard_reward_distributions` - Historique recompenses
- `period_closures` - Periodes fermees (1 ligne)
- `period_reward_configs` - Config personnalisee

### Transactions
- `receipts` - Tickets de caisse (58 lignes)
- `receipt_lines` - Lignes de paiement (58 lignes)
- `gains` - Gains XP/cashback (58 lignes)
- `spendings` - Depenses cashback (5 lignes)

### Contenu (migre depuis Directus)
- `beers` - Catalogue bieres (196 lignes)
- `breweries` - Brasseries (66 lignes)
- `beer_styles` - Styles de bieres (47 lignes)
- `establishments` - Etablissements (7 lignes)
- `news` - Actualites (2 lignes)
- `level_thresholds` - Seuils de niveaux (30 lignes)

### Social
- `likes` - Likes (8 lignes)
- `comments` - Commentaires (2 lignes)
- `notes` - Notes

### Autres
- `badge_types` - Types de badges (9 lignes)
- `constants` - Constantes systeme (2 lignes)

### Tables de liaison (M2M)
- `beers_establishments` - Bieres-Etablissements (43 lignes)
- `beers_beer_styles` - Bieres-Styles (285 lignes)
- `news_establishments` - News-Etablissements (3 lignes)

## Migrations

Les 40 migrations SQL sont appliquees automatiquement. Les dernieres concernent la migration du contenu depuis Directus vers Supabase.

## Ressources

- [Documentation officielle Supabase](https://supabase.com/docs)
- [API Reference](https://supabase.com/docs/reference)
- [Dashboard](https://app.supabase.com)

## Derniere mise a jour

- **Date**: 2026-01-23
