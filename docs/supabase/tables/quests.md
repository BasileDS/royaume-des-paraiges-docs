# Table: quests

Définition des quêtes périodiques disponibles. Modèle template récurrent : une quête est instanciée par utilisateur × période via `quest_progress`.

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 32 (avril 2026 : 7 actives, 17 doublons désactivés, 6 consumption inactives, 2 monthly extra) |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | PK |
| `name` | `varchar(255)` | Non | - | Nom narratif (ex. « Cent pas sur la piste ») |
| `description` | `text` | Oui | - | Description fonctionnelle courte |
| `lore` | `text` | Oui | - | Texte narratif immersif (~150 chars), affiché dans la modale côté client |
| `slug` | `varchar(100)` | Non | - | Identifiant unique (UNIQUE) |
| `quest_type` | enum `quest_type` | Non | - | 6 valeurs (cf. ci-dessous) |
| `consumption_type` | enum `consumption_type` | Oui | - | **Obligatoire ssi `quest_type = 'consumption_count'`** (CHECK constraint). Sinon NULL. |
| `target_value` | `integer` | Non | - | Objectif à atteindre. Pour `amount_spent`, en **centimes** (50 € = 5000). |
| `period_type` | `varchar(20)` | Non | - | `weekly` / `monthly` / `yearly` |
| `coupon_template_id` | `bigint` | Oui | - | FK → `coupon_templates`. Récompense en bonus PdB direct ou coupon % à la complétion. |
| `badge_type_id` | `bigint` | Oui | - | FK → `badge_types`. Badge attribué à la complétion. |
| `bonus_xp` | `integer` | Non | 0 | XP bonus en plus des gains normaux |
| `bonus_cashback` | `integer` | Non | 0 | Cashback bonus en centimes |
| `is_active` | `boolean` | Non | true | Visible côté client. Désactiver pour archiver sans supprimer. |
| `display_order` | `integer` | Non | 0 | Ordre d'affichage |
| `created_at` | `timestamptz` | Non | now() | - |
| `updated_at` | `timestamptz` | Non | now() | - |
| `created_by` | `uuid` | Oui | - | Admin qui a créé la quête |

## Enum `quest_type`

| Valeur | Description |
|---|---|
| `xp_earned` | Gagner X XP sur la période |
| `amount_spent` | Dépenser X centimes sur la période |
| `establishments_visited` | Visiter X établissements distincts sur la période |
| `orders_count` | Passer X commandes sur la période |
| `quest_completed` | Compléter au moins 1 quête dans X sous-périodes (`monthly→weekly`, `yearly→monthly`). **Incompatible avec `weekly`**. |
| `consumption_count` | Consommer X produits du type `consumption_type` (avril 2026). Calcul : SUM(`receipt_consumption_items.quantity` WHERE `consumption_type = quests.consumption_type`) sur la période. |

## Enum `consumption_type` (utilisé par `consumption_count`)

`cocktail`, `biere`, `alcool`, `soft`, `boisson_chaude`, `restauration`

## Contraintes CHECK

- `quests_consumption_type_consistency` : `(quest_type = 'consumption_count' AND consumption_type IS NOT NULL) OR (quest_type <> 'consumption_count' AND consumption_type IS NULL)`

## Clés primaires

- `id`

## Index uniques

- `quests_slug_key` UNIQUE sur `slug`

## Relations (Foreign Keys)

- `quests_badge_type_id_fkey` : `badge_type_id` → `badge_types.id`
- `quests_coupon_template_id_fkey` : `coupon_template_id` → `coupon_templates.id`
- `quests_created_by_fkey` : `created_by` → `profiles.id`

## Fonctions liées

- `calculate_quest_progress(p_customer_id, p_quest_id, p_period_identifier)` — calcule la progression actuelle pour un user × quête × période. Branche par `quest_type` (étendue avec `consumption_count` en migration 011).
- `update_quest_progress_for_receipt(p_receipt_id)` — appelée par `create_receipt`, propage les progressions à toutes les quêtes actives.
- `distribute_quest_reward(p_quest_progress_id)` — attribue le coupon + badge + bonus XP/cashback à la complétion.

## Quêtes actives en prod (avril 2026, post-refonte)

7 quêtes actives pour les Compagnons :

| ID | Slug | Type | Period | Cible | Bonus | Badge |
|---|---|---|---|---|---|---|
| 8 | `gagner_100xp` | xp_earned | weekly | 100 XP | +25 XP / 5 € | — |
| 9 | `passer_10_commandes` | orders_count | weekly | 10 cmd | +25 XP / 5 € | — |
| 27 | `500xp_pour_15` | xp_earned | monthly | 500 XP | +100 XP / 15 € | — |
| 28 | `30_commandes_pour_12` | orders_count | monthly | 30 cmd | +100 XP / 15 € | — |
| 30 | `monthly_tour_royaume` | establishments_visited | monthly | 3 tavernes | +50 XP / 5 € | quest_pelerin |
| 31 | `monthly_le_bon_buveur` | amount_spent | monthly | 50 € | +50 XP / 10 € | — |
| 32 | `yearly_fidele_parmi_fideles` | quest_completed | yearly | 12 mois | +500 XP / 50 € | quest_fidele_legendary |

## Quêtes consumption hebdo prêtes mais désactivées (avril 2026)

6 quêtes `consumption_count` (`is_active = false` par défaut), à activer une à une depuis l'admin :

| Slug | consumption_type | Cible |
|---|---|---|
| `weekly_5_bieres` | biere | 5 |
| `weekly_3_cocktails` | cocktail | 3 |
| `weekly_2_alcools` | alcool | 2 |
| `weekly_3_softs` | soft | 3 |
| `weekly_2_boissons_chaudes` | boisson_chaude | 2 |
| `weekly_1_restauration` | restauration | 1 |

Bonus standard : +25 XP / 2-5 €. Pas de badge attaché en V1.
