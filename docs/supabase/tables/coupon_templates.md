# Table: coupon_templates

Modeles de coupons reutilisables

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 23 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | - |
| `name` | `varchar` | Non | - | - |
| `description` | `text` | Oui | - | - |
| `amount` | `integer` | Oui | - | Montant en centimes |
| `percentage` | `integer` | Oui | - | Pourcentage de reduction |
| `establishment_id` | `integer` | Oui | - | ID etablissement Directus |
| `validity_days` | `integer` | Oui | - | Jours de validite |
| `is_active` | `boolean` | Oui | true | - |
| `created_at` | `timestamp with time zone` | Oui | now() | - |
| `updated_at` | `timestamp with time zone` | Oui | now() | - |
| `created_by` | `uuid` | Oui | - | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
