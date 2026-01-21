# Table: coupons

Coupons de reduction utilisateurs

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 2 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `bigint` | Non | - | - |
| `created_at` | `timestamp with time zone` | Non | now() | - |
| `customer_id` | `uuid` | Non | - | - |
| `used` | `boolean` | Non | false | - |
| `amount` | `integer` | Oui | - | - |
| `percentage` | `integer` | Oui | - | - |
| `template_id` | `bigint` | Oui | - | Reference au template |
| `expires_at` | `timestamp with time zone` | Oui | - | Date d'expiration |
| `distribution_type` | `varchar` | Oui | - | Type de distribution |
| `period_identifier` | `varchar` | Oui | - | Identifiant de periode |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
