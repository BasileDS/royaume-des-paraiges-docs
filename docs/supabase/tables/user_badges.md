# Table: user_badges

Collection des badges obtenus par chaque utilisateur.

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | Variable (attribution rétroactive avril 2026 a injecté ~57 badges achievement) |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `integer` | Non | nextval('user_badges_id_seq'::regclass) | - |
| `customer_id` | `uuid` | Non | - | FK vers `profiles.id` |
| `badge_id` | `integer` | Non | - | FK vers `badge_types.id` |
| `earned_at` | `timestamp with time zone` | Oui | now() | - |
| `period_type` | `character varying(20)` | Oui | - | Voir contraintes CHECK ci-dessous |
| `period_identifier` | `character varying(50)` | Oui | - | Identifiant de période (`2025-W03` pour semaine, `2025-01` pour mois, `2025` pour année). **NULL pour les badges `achievement`** (pas de notion de période). |
| `rank` | `integer` | Oui | - | Rang obtenu (top 10 classement). NULL pour les badges saison + achievement. |
| `seen_at` | `timestamp with time zone` | Oui | NULL | **Déclencheur modale de célébration** : NULL = pas encore vu par l'utilisateur → affichage de la modale au prochain foreground. Rempli au dismiss via `mark_badges_seen()`. Ajouté migration `022` (avril 2026). |
| `created_at` | `timestamp with time zone` | Oui | now() | - |

## Contraintes CHECK

- `period_type` ∈ `{weekly, monthly, yearly, achievement}` *(étendu avril 2026 — migration `022_achievement_badges_schema.sql`)*

## Cles primaires

- `id`

## Index

- UNIQUE `(customer_id, badge_id, period_identifier)` — contrainte existante, fonctionne pour les badges à period_identifier non-NULL
- **UNIQUE partiel** `(customer_id, badge_id) WHERE period_type = 'achievement'` (`user_badges_achievement_unique`) — déduplication spécifique des badges succès, puisque leur `period_identifier` est toujours NULL et que `NULL ≠ NULL` en UNIQUE standard
- INDEX partiel `(customer_id, seen_at) WHERE seen_at IS NULL` (`user_badges_seen_at_idx`) — optimise le lookup des badges non-vus (modale de célébration)

## Relations (Foreign Keys)

- `user_badges_badge_id_fkey`: `badge_id` → `badge_types.id` (**ON DELETE RESTRICT** depuis migration 031) — un hard-delete sur `badge_types` est désormais bloqué si des `user_badges` référencent ce badge. L'admin doit utiliser le soft-delete via `archived_at` (flux normal) ou faire un hard-delete explicite en deux temps (DELETE user_badges puis DELETE badge_types).
- `user_badges_customer_id_fkey`: `customer_id` → `profiles.id` (ON DELETE CASCADE — la suppression d'un profil supprime ses badges, comportement voulu RGPD)

## Notes

- **Back-fill `seen_at`** (migration 022) : tous les badges obtenus avant avril 2026 ont été marqués comme vus (`seen_at = earned_at`) pour ne pas déclencher la modale de célébration rétroactivement.
- **Attribution rétroactive** des 5 badges achievement à la migration 025 : les badges nouvellement attribués ont aussi été pré-marqués `seen_at = earned_at` (pas de spam modale au premier login post-déploiement).
