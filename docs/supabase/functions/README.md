# Fonctions PostgreSQL

Cette section documente toutes les fonctions PostgreSQL disponibles dans le schema `public`.

## Liste des fonctions (29)

| Fonction | Arguments | Retour | Volatilite | Security Definer |
|----------|-----------|--------|------------|------------------|
| `award_user_badge` | p_customer_id uuid, p_badge_slug varchar, p_period_type varchar, p_period_identifier varchar, p_rank bigint | `json` | VOLATILE | Oui |
| `calculate_gains` | p_amount_for_gains integer | `jsonb` | VOLATILE | Non |
| `check_cashback_balance` | p_customer_id uuid, p_cashback_requested integer | `jsonb` | VOLATILE | Non |
| `check_email_exists` | email_to_check text | `boolean` | VOLATILE | Oui |
| `check_period_closed` | p_period_type varchar, p_period_identifier varchar | `boolean` | VOLATILE | Non |
| `create_frequency_coupon` | p_customer_id uuid | `json` | VOLATILE | Oui |
| `create_leaderboard_reward_coupon` | p_customer_id uuid, p_amount integer, p_percentage integer | `json` | VOLATILE | Oui |
| `create_manual_coupon` | p_customer_id uuid, p_template_id bigint, p_amount integer, p_percentage integer, p_expires_at timestamptz, p_validity_days integer, p_notes text, p_admin_id uuid | `jsonb` | VOLATILE | Oui |
| `create_receipt` | p_customer_id uuid, p_establishment_id bigint, p_payment_methods jsonb, p_coupon_ids bigint[] | `jsonb` | VOLATILE | Oui |
| `create_spending_from_cashback_payment` | - | `trigger` | VOLATILE | Non |
| `create_weekly_coupon` | p_customer_id uuid | `json` | VOLATILE | Oui |
| `distribute_leaderboard_rewards` | p_period_type varchar, p_force boolean | `json` | VOLATILE | Oui |
| `distribute_period_rewards_v2` | p_period_type varchar, p_period_identifier varchar, p_force boolean, p_preview_only boolean, p_admin_id uuid | `jsonb` | VOLATILE | Oui |
| `get_coupon_stats` | - | `jsonb` | VOLATILE | Oui |
| `get_current_user_role` | - | `text` | VOLATILE | Oui |
| `get_customer_available_coupons` | p_customer_id uuid | `TABLE` | VOLATILE | Oui |
| `get_period_identifier` | p_period_type varchar, p_date timestamptz | `varchar` | IMMUTABLE | Non |
| `get_period_preview` | p_period_type varchar, p_period_identifier varchar | `jsonb` | VOLATILE | Oui |
| `get_user_badges` | p_customer_id uuid | `TABLE` | VOLATILE | Non |
| `get_user_cashback_balance` | p_customer_id uuid | `jsonb` | STABLE | Non |
| `get_user_complete_stats` | p_customer_id uuid | `jsonb` | STABLE | Non |
| `get_user_info` | user_ids uuid[] | `TABLE` | VOLATILE | Oui |
| `get_user_xp_stats` | p_customer_id uuid | `jsonb` | STABLE | Non |
| `handle_new_user` | - | `trigger` | VOLATILE | Oui |
| `handle_user_delete` | - | `trigger` | VOLATILE | Oui |
| `sync_auth_to_profiles` | - | `TABLE` | VOLATILE | Oui |
| `update_profile_from_auth` | user_id uuid | `void` | VOLATILE | Oui |
| `validate_coupons` | p_customer_id uuid, p_coupon_ids bigint[] | `jsonb` | VOLATILE | Non |
| `validate_payment_methods` | p_payment_methods jsonb | `jsonb` | VOLATILE | Non |

## Descriptions


### award_user_badge

Attribue un badge a un utilisateur pour une periode donnee

- **Arguments**: `p_customer_id uuid, p_badge_slug varchar, p_period_type varchar, p_period_identifier varchar, p_rank bigint`
- **Retour**: `json`


### calculate_gains

Calcule les gains XP et cashback

- **Arguments**: `p_amount_for_gains integer`
- **Retour**: `jsonb`


### check_cashback_balance

Verifie le solde cashback d'un utilisateur

- **Arguments**: `p_customer_id uuid, p_cashback_requested integer`
- **Retour**: `jsonb`


### check_email_exists

Verifie si un email existe

- **Arguments**: `email_to_check text`
- **Retour**: `boolean`


### check_period_closed

Verifie si une periode de leaderboard a deja ete fermee

- **Arguments**: `p_period_type varchar, p_period_identifier varchar`
- **Retour**: `boolean`


### create_frequency_coupon

Cree un coupon de frequence (5% si 10+ commandes/semaine)

- **Arguments**: `p_customer_id uuid`
- **Retour**: `json`


### create_leaderboard_reward_coupon

Cree un coupon de recompense leaderboard

- **Arguments**: `p_customer_id uuid, p_amount integer, p_percentage integer`
- **Retour**: `json`


### create_manual_coupon

Cree un coupon manuellement

- **Arguments**: `p_customer_id uuid, p_template_id bigint, p_amount integer, p_percentage integer, p_expires_at timestamptz, p_validity_days integer, p_notes text, p_admin_id uuid`
- **Retour**: `jsonb`


### create_receipt

Cree un recu avec paiements, coupons et gains

- **Arguments**: `p_customer_id uuid, p_establishment_id bigint, p_payment_methods jsonb, p_coupon_ids bigint[]`
- **Retour**: `jsonb`


### create_spending_from_cashback_payment

Trigger: cree un spending lors d'un paiement cashback

- **Arguments**: `aucun`
- **Retour**: `trigger`


### create_weekly_coupon

Cree un coupon hebdomadaire (3,90EUR si 50EUR+ depenses)

- **Arguments**: `p_customer_id uuid`
- **Retour**: `json`


### distribute_leaderboard_rewards

Distribue les recompenses leaderboard (legacy)

- **Arguments**: `p_period_type varchar, p_force boolean`
- **Retour**: `json`


### distribute_period_rewards_v2

Distribution configurable des recompenses avec tiers

- **Arguments**: `p_period_type varchar, p_period_identifier varchar, p_force boolean, p_preview_only boolean, p_admin_id uuid`
- **Retour**: `jsonb`


### get_coupon_stats

Statistiques globales des coupons

- **Arguments**: `aucun`
- **Retour**: `jsonb`


### get_current_user_role

Retourne le role de l'utilisateur courant

- **Arguments**: `aucun`
- **Retour**: `text`


### get_customer_available_coupons

Coupons disponibles d'un client

- **Arguments**: `p_customer_id uuid`
- **Retour**: `TABLE`


### get_period_identifier

Calcule l'identifiant de periode (2026-W04, 2026-01, 2026)

- **Arguments**: `p_period_type varchar, p_date timestamptz`
- **Retour**: `varchar`


### get_period_preview

Previsualise la distribution des recompenses

- **Arguments**: `p_period_type varchar, p_period_identifier varchar`
- **Retour**: `jsonb`


### get_user_badges

Recupere tous les badges d'un utilisateur

- **Arguments**: `p_customer_id uuid`
- **Retour**: `TABLE`


### get_user_cashback_balance

Solde cashback depuis la vue materialisee

- **Arguments**: `p_customer_id uuid`
- **Retour**: `jsonb`


### get_user_complete_stats

Statistiques completes d'un utilisateur

- **Arguments**: `p_customer_id uuid`
- **Retour**: `jsonb`


### get_user_info

Informations utilisateur par IDs

- **Arguments**: `user_ids uuid[]`
- **Retour**: `TABLE`


### get_user_xp_stats

Statistiques XP d'un utilisateur

- **Arguments**: `p_customer_id uuid`
- **Retour**: `jsonb`


### handle_new_user

Cree un profil lors de la creation d'un utilisateur

- **Arguments**: `aucun`
- **Retour**: `trigger`


### handle_user_delete

Supprime le profil lors de la suppression d'un utilisateur

- **Arguments**: `aucun`
- **Retour**: `trigger`


### sync_auth_to_profiles

Synchronise auth.users vers profiles

- **Arguments**: `aucun`
- **Retour**: `TABLE`


### update_profile_from_auth

Met a jour un profil depuis auth.users

- **Arguments**: `user_id uuid`
- **Retour**: `void`


### validate_coupons

Valide une liste de coupons

- **Arguments**: `p_customer_id uuid, p_coupon_ids bigint[]`
- **Retour**: `jsonb`


### validate_payment_methods

Valide les methodes de paiement

- **Arguments**: `p_payment_methods jsonb`
- **Retour**: `jsonb`

