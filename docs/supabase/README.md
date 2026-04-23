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

- **36 tables** public avec RLS active
- **58 fonctions** PostgreSQL (incluant `check_quest_redundancy` + 3 trigger functions + 14 fonctions achievement ajoutées en migrations 022-026)
- **4 vues materialisees** (leaderboards, stats)
- **2 vues** (reward_distribution_stats, avg_ticket_12m)
- **4 triggers** automatiques (voir `triggers/README.md`)
- **4 jobs pg_cron** pour distributions automatiques (dont `award_achievements_cron` quotidien 02:00 UTC)
- **2 buckets storage** (avatars, content-assets)
- **1 edge function** (send-contact-email)
- **4 enums** personnalises (consumption_type, payment_method, quest_type, user_role)

## Tables par Categorie

### Utilisateurs & Auth
- `profiles` - Profils utilisateurs (35 lignes)
- `user_badges` - Badges obtenus (2 lignes)

### Coupons & Recompenses
- `coupons` - Coupons utilisateurs (2 lignes)
- `coupon_templates` - Modeles de coupons (23 lignes)
- `coupon_distribution_logs` - Historique distributions
- `reward_tiers` - Paliers de recompenses (6 lignes)

### Quetes
- `quests` - Definition des quetes (4 lignes)
- `quest_progress` - Progression utilisateurs (40 lignes)
- `quest_completion_logs` - Historique completions (7 lignes)
- `quest_periods` - Liaison quetes-periodes (4 lignes)
- `available_periods` - Periodes disponibles (130 lignes)

### Leaderboard
- `leaderboard_reward_distributions` - Historique recompenses
- `period_closures` - Periodes fermees (1 ligne)
- `period_reward_configs` - Config personnalisee (3 lignes)

### Transactions
- `receipts` - Tickets de caisse (64 lignes)
- `receipt_lines` - Lignes de paiement (65 lignes)
- `receipt_consumption_items` - Types de consommation (optionnel)
- `gains` - Gains XP/cashback (72 lignes)
- `spendings` - Depenses cashback (1 ligne)

### Contenu
- `beers` - Catalogue bieres (196 lignes)
- `breweries` - Brasseries (66 lignes)
- `beer_styles` - Styles de bieres (47 lignes)
- `establishments` - Etablissements (7 lignes)
- `news` - Actualites (2 lignes)
- `level_thresholds` - Seuils de niveaux (30 lignes)

### Social
- `likes` - Likes (29 lignes)
- `comments` - Commentaires (2 lignes)
- `notes` - Notes

### Autres
- `badge_types` - Types de badges (20 lignes : 9 classement + 6 saison + 5 succès)
- `constants` - Constantes systeme (2 lignes)

### Configuration
- `legal_pages` - Pages legales (2 lignes)
- `admin_settings` - Parametrage admin key-value JSONB (2 lignes)

### Tables de liaison (M2M)
- `beers_establishments` - Bieres-Etablissements (43 lignes)
- `beers_beer_styles` - Bieres-Styles (285 lignes)
- `news_establishments` - News-Etablissements (3 lignes)
- `quests_establishments` - Scoping quetes par etablissement (0 ligne, quetes globales par defaut)

## Migrations

Les 72 migrations SQL sont appliquees automatiquement. Les dernieres concernent le systeme de bonus cashback (fevrier 2026), les pages legales et les periodes dans les gains.

## Ressources

- [Documentation officielle Supabase](https://supabase.com/docs)
- [API Reference](https://supabase.com/docs/reference)
- [Dashboard](https://app.supabase.com)

## Derniere mise a jour

- **Date**: 2026-04-22
- **Migration 020** — Prerequis prevention quetes redondantes : tables `quests_establishments`, `admin_settings`, vue `avg_ticket_12m`.
- **Migration 021** — Triggers de detection : fonction `check_quest_redundancy` + 3 triggers (errcode `P0421`) bloquant toute activation/scope creant une redondance.
- **Migration 022** — Schéma « badges succès » : extension CHECK sur `badge_types.category` et `user_badges.period_type` (ajout `achievement`), colonnes `criterion_type`/`criterion_params`/`evaluation_mode`/`archived_at` sur `badge_types`, `seen_at` sur `user_badges`, index unique partiel achievement, back-fill seen_at.
- **Migration 023** — 12 fonctions de check et de progression (une par `criterion_type`).
- **Migration 024** — Dispatchers + RPCs achievement (`award_achievements_for_user`, `award_achievements_for_all_for_badge`, `award_achievements_for_all_cron`, `get_achievement_progress`, `get_unseen_badges`, `mark_badges_seen`).
- **Migration 025** — Seed 5 badges achievement + attribution rétroactive + pré-marquage `seen_at`.
- **Migration 026** — `create_receipt` patchée avec appel `award_achievements_for_user` (étape 12b) protégé par EXCEPTION local.
- **Migration 027** — pg_cron `award_achievements_cron` planifié à `0 2 * * *`.
- **Migration 030** (2026-04-23) — Durcissement RLS des 5 RPCs achievement : check `auth.uid() = p_customer_id` (ou admin/employee/establishment selon la RPC) ; REVOKE EXECUTE du cron pour PUBLIC/authenticated/anon.
- **Migration 031** (2026-04-23) — FK `user_badges.badge_id` passée de `ON DELETE CASCADE` à `ON DELETE RESTRICT` pour forcer l'usage du soft-delete (`badge_types.archived_at`).
- Détails complets : cf. `functions/achievement_badges.md`.
