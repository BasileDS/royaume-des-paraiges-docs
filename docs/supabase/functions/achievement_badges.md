# Fonctions « Badges succès » (achievement)

Système de badges débloqués automatiquement par les joueurs selon un critère paramétrable. Introduit en avril 2026 via les migrations **022-027**.

## Vue d'ensemble

- Catégorie `achievement` sur `badge_types` (cf. `tables/badge_types.md`).
- Déclenchement **par badge** : `evaluation_mode ∈ {realtime, cron}`.
  - `realtime` : hook dans `create_receipt` (étape 12b) appelant `award_achievements_for_user(customer, 'realtime')`.
  - `cron` : job pg_cron `award_achievements_cron` quotidien à 02:00 UTC appelant `award_achievements_for_all_cron()`.
- **Idempotent** via index unique partiel `user_badges_achievement_unique (customer_id, badge_id) WHERE period_type = 'achievement'` + `ON CONFLICT DO NOTHING`.
- **Prestige pur** : aucun XP ou cashback associé à l'attribution.
- **Modale de célébration** côté front via `user_badges.seen_at IS NULL` → `get_unseen_badges()` / `mark_badges_seen()`.

---

## Fonctions de check (6, `*_check_achievement_*`)

Signature uniforme : `(p_customer_id uuid, p_params jsonb) RETURNS boolean`.
Toutes en `SECURITY DEFINER SET search_path = public`.

| Fonction | Critère | Params attendus |
|---|---|---|
| `check_achievement_first_order` | ≥ 1 receipt pour le client | `{}` |
| `check_achievement_orders_threshold` | `COUNT(receipts) >= threshold` | `{"threshold": int}` |
| `check_achievement_cities_visited` | `COUNT(DISTINCT establishments.city) >= min_cities` (ignore `city IS NULL`) | `{"min_cities": int}` |
| `check_achievement_all_establishments_visited` | `COUNT(DISTINCT establishment_id) = (SELECT COUNT(*) FROM establishments)` | `{}` |
| `check_achievement_establishments_threshold` | `COUNT(DISTINCT establishment_id) >= threshold` | `{"threshold": int}` |
| `check_achievement_consecutive_weekly_quests` | ≥ `n_weeks` semaines ISO consécutives avec au moins 1 `quest_progress.status IN ('completed','rewarded')` et `period_type = 'weekly'`. Détection via gap-and-islands sur `to_date(REPLACE(period_identifier, '-W', '-'), 'IYYY-IW')`. | `{"n_weeks": int}` |

Retour : `true` si le client remplit le critère, `false` sinon. Une valeur de paramètre invalide (≤ 0 ou manquant) renvoie `false`.

## Fonctions de progression (6, `progress_achievement_*`)

Même dispatch que les `check_*` mais retournent `{"current": int, "target": int}` pour affichage côté front. Consommées via `get_achievement_progress()` à l'ouverture de la modale de détail d'un badge verrouillé.

---

## RPCs côté backend + front

### `award_achievements_for_user(p_customer_id uuid, p_mode text DEFAULT NULL) RETURNS jsonb`

Dispatcher principal. Itère `badge_types` où `category = 'achievement' AND archived_at IS NULL AND criterion_type IS NOT NULL` (et `evaluation_mode = p_mode` si `p_mode` fourni). Pour chaque badge pas encore obtenu par le client, appelle la fonction `check_*` correspondante. Si `true`, insert dans `user_badges` avec `period_type = 'achievement', period_identifier = NULL, rank = NULL, seen_at = NULL`.

Short-circuit : si le client a déjà obtenu un badge, la fonction `check_*` n'est pas appelée (évite les requêtes inutiles).

Retour : JSON array des badges nouvellement attribués : `[{"id": 16, "slug": "achievement_first_order"}, ...]` (vide si aucun).

Grants : `authenticated`.

### `award_achievements_for_all_for_badge(p_badge_id bigint) RETURNS jsonb`

Réévaluation d'un seul badge pour tous les clients non-test. Utilisée côté admin post-création ou post-édition d'un badge pour attribuer rétroactivement aux joueurs éligibles.

Retour : `{"awarded_count": int}` ou `{"awarded_count": 0, "skipped": "archived"|"no_criterion"}`.

Grants : `authenticated`.

### `award_achievements_for_all_cron() RETURNS jsonb`

Batch planifié par pg_cron à 02:00 UTC via le job `award_achievements_cron` (migration `027`). Itère tous les `profiles.role = 'client' AND is_test IS NOT TRUE` en appelant `award_achievements_for_user(id, 'cron')`. Erreurs individuelles capturées via `EXCEPTION WHEN OTHERS THEN RAISE WARNING` — une ligne en erreur n'interrompt pas le batch.

Retour : `{"total_awarded": int}`.

### `get_achievement_progress(p_customer_id uuid, p_badge_slug text) RETURNS jsonb`

Appelée à l'ouverture de la modale de détail d'un badge verrouillé côté front. Dispatcher miroir du dispatcher d'attribution, appelle la fonction `progress_*` correspondante.

Retour : `{"current": int, "target": int, "criterion_type": text|null}`. Si le badge n'existe pas ou n'est pas de catégorie `achievement` : `{"current": 0, "target": 0, "criterion_type": null}`.

Grants : `authenticated`.

### `get_unseen_badges(p_customer_id uuid) RETURNS TABLE(...)`

Retourne les lignes `user_badges` de ce client où `seen_at IS NULL`, joint `badge_types` pour exposer les métadonnées (slug, name, description, lore, icon, rarity, category, earned_at). Triées par `earned_at ASC` (FIFO pour la file de célébration).

Grants : `authenticated`.

### `mark_badges_seen(p_customer_id uuid, p_user_badge_ids bigint[]) RETURNS void`

Update `user_badges.seen_at = now()` pour les IDs passés, uniquement si l'appelant est bien le propriétaire (`customer_id = p_customer_id`) et si `seen_at IS NULL` (pas de re-update). Appelé côté front après dismiss de la modale de célébration.

Grants : `authenticated`.

---

## Intégration côté front (royaume-paraiges-front)

| Couche | Fichier | Rôle |
|---|---|---|
| Types | `src/features/gains/types/badge.types.ts` | `BadgeCategory` étendu à `achievement`, `AchievementCriterionType`, `AchievementProgress`, `UserBadge.user_badge_id?` |
| Service | `src/features/gains/services/badgeService.ts` | Méthodes `getAchievementProgress`, `getUnseenBadges`, `markBadgesSeen` |
| Hook | `src/features/gains/hooks/useUnseenBadges.ts` | TanStack Query + invalidation croisée |
| Provider | `src/features/gains/context/UnseenBadgesProvider.tsx` | Montage global de la modale, AppState listener pour refresh au foreground |
| UI | `components/badges/AchievementUnlockedModal.tsx` | Modale de célébration animée (Reanimated v3 + haptic) |
| UI | `components/badges/AchievementProgressBar.tsx` | Barre de progression dans la modale de détail |
| UI | `app/badges.tsx` | Catégorie `achievement` ajoutée en dernier dans `CATEGORIES` |
| Config | `src/config/rewards.config.ts` | Palette bronze-cuivre pour la catégorie + factorisation `BADGE_CATEGORY_ORDER` / `BADGE_CATEGORY_LABELS` |

## Intégration côté admin (royaume-paraiges-admin)

| Couche | Fichier | Rôle |
|---|---|---|
| Service | `src/lib/services/achievementBadgeService.ts` | CRUD complet + `archiveAchievementBadge` (soft-delete) + `reawardAchievementBadge` (relance attribution) |
| Pages | `src/app/(dashboard)/rewards/achievements/` (`page.tsx`, `create/`, `[id]/`) | Liste + formulaire dynamique selon `criterion_type` + AlertDialog soft-delete |
| Nav | `src/components/layout/Sidebar.tsx` | Entrée « Badges succès » (icône `Medal`) dans le groupe Récompenses |

---

## Stratégie de dépréciation

Les badges achievement **ne se hard-deletent pas** : la FK `user_badges.badge_id` est `ON DELETE CASCADE`, ce qui supprimerait aussi tous les badges des joueurs. Utiliser `archived_at = now()` via `archiveAchievementBadge()` / SQL direct : le badge ne sera plus attribué mais reste visible dans les collections des joueurs qui l'ont déjà obtenu.

## Interaction avec les quêtes (migrations 020/021)

Aucune interférence : mes migrations touchent uniquement `badge_types`, `user_badges`, `create_receipt`. Les triggers de redondance des quêtes (`trg_quests_enforce_redundancy`, `trg_qe_enforce_redundancy_*`) ne se déclenchent pas pour les opérations achievement.
