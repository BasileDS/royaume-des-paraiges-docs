# Table: spendings

Pas de description disponible.

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | -1 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | - |
| `created_at` | `timestamp with time zone` | Non | now() | - |
| `amount` | `integer` | Non | - | - |
| `customer_id` | `uuid` | Non | - | - |
| `establishment_id` | `integer` | Non | - | FK vers establishments.id |
| `receipt_id` | `bigint` | Oui | - | FK vers receipts.id |
| `source_type` | `character varying(30)` | Oui | NULL | Reserve pour tracking futur des categories de PdB depense |

## Cles primaires

- `id`

## Index

- `idx_spendings_created_at` sur `created_at`
- `idx_spendings_establishment_id` sur `establishment_id`
- `idx_spendings_receipt_id` sur `receipt_id`

## Relations (Foreign Keys)

- `spendings_customer_id_fkey`: customer_id → profiles.id
- `spendings_establishment_id_fkey`: establishment_id → establishments.id
- `spendings_receipt_id_fkey`: receipt_id → receipts.id
