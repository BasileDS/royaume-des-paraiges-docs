# Table: receipts

Pas de description disponible.

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 42 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | - |
| `created_at` | `timestamp with time zone` | Non | now() | - |
| `amount` | `integer` | Non | - | - |
| `customer_id` | `uuid` | Non | - | FK vers profiles.id (le client) |
| `establishment_id` | `integer` | Non | - | FK vers establishments.id |
| `employee_id` | `uuid` | Oui | - | FK vers profiles.id (l'employe qui a cree le receipt). NULL pour les receipts historiques. |

## Cles primaires

- `id`

## Index

- `idx_receipts_employee_id` sur `employee_id`
- `idx_receipts_establishment_id` sur `establishment_id`

## Relations (Foreign Keys)

- `receipts_customer_id_fkey`: customer_id → profiles.id
- `receipts_employee_id_fkey`: employee_id → profiles.id
- `receipts_establishment_id_fkey`: establishment_id → establishments.id
