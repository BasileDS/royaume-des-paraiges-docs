# Table: coupon_templates

Modèles de coupons réutilisables pour les récompenses

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
| `name` | `character varying(255)` | Non | - | - |
| `description` | `text` | Oui | - | - |
| `amount` | `integer` | Oui | - | Montant en centimes (ex: 1000 = 10€) |
| `percentage` | `integer` | Oui | - | Pourcentage de réduction (ex: 15 = 15%) |
| `establishment_id` | `integer` | Oui | - | ID établissement Directus. NULL = valable partout |
| `validity_days` | `integer` | Oui | - | Jours de validité après attribution. NULL = pas d'expiration |
| `is_active` | `boolean` | Oui | true | - |
| `created_at` | `timestamp with time zone` | Oui | now() | - |
| `updated_at` | `timestamp with time zone` | Oui | now() | - |
| `created_by` | `uuid` | Oui | - | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

- `coupon_templates_created_by_fkey`: created_by → profiles.id
