# Table: gains

Enregistre les gains (XP et cashback) des utilisateurs. Peut etre lie a un receipt (commande) ou etre un credit direct (bonus cashback).

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | PK |
| `created_at` | `timestamp with time zone` | Non | now() | - |
| `customer_id` | `uuid` | Non | - | FK vers profiles.id |
| `receipt_id` | `bigint` | Oui | - | FK vers receipts.id (NULL pour bonus cashback direct) |
| `establishment_id` | `integer` | Oui | - | FK vers establishments.id (NULL pour bonus cashback direct) |
| `xp` | `integer` | Oui | - | XP gagnes |
| `cashback_money` | `integer` | Oui | - | Cashback gagne (centimes) |
| `source_type` | `varchar(30)` | Oui | 'receipt' | Type de source du gain |
| `coupon_id` | `bigint` | Oui | - | FK vers coupons.id (tracabilite du coupon source) |

## Valeurs de source_type

| Valeur | Description |
|--------|-------------|
| `receipt` | Gain genere par une commande (create_receipt) |
| `bonus_cashback_manual` | Bonus cashback attribue manuellement par un admin |
| `bonus_cashback_leaderboard` | Bonus cashback distribue via le leaderboard |
| `bonus_cashback_quest` | Bonus cashback gagne via une quete |
| `bonus_cashback_trigger` | Bonus cashback genere par un trigger (ex: depenses hebdo > 50EUR) |
| `bonus_cashback_migration` | Bonus cashback migre depuis un ancien coupon montant fixe |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `gains_customer_id_fkey`: customer_id -> profiles.id
- `gains_receipt_id_fkey`: receipt_id -> receipts.id
- `gains_establishment_id_fkey`: establishment_id -> establishments.id
- `gains_coupon_id_fkey`: coupon_id -> coupons.id

## Index

- `idx_gains_customer_id` sur customer_id
- `idx_gains_source_type` sur source_type
- `idx_gains_coupon_id` sur coupon_id
