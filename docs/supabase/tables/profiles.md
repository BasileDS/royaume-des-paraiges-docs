# Table: profiles

Pas de description disponible.

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 18 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `uuid` | Non | gen_random_uuid() | - |
| `created_at` | `timestamp with time zone` | Non | now() | - |
| `attached_establishment_id` | `integer` | Oui | - | - |
| `email` | `text` | Oui | - | Email de l'utilisateur (synchronisé depuis auth.users) |
| `first_name` | `text` | Oui | - | Prénom (peut être extrait de full_name) |
| `last_name` | `text` | Oui | - | Nom de famille (peut être extrait de full_name) |
| `avatar_url` | `text` | Oui | - | URL de la photo de profil |
| `phone` | `text` | Oui | - | Numéro de téléphone |
| `birthdate` | `date` | Oui | - | Date de naissance |
| `updated_at` | `timestamp with time zone` | Oui | now() | - |
| `username` | `text` | Oui | - | - |
| `role` | `user_role` | Non | 'client'::user_role | - |
| `xp_coefficient` | `integer` | Non | 100 | - |
| `cashback_coefficient` | `integer` | Non | 100 | - |

## Cles primaires

- `id`

## Relations (Foreign Keys)

Aucune relation definie.
