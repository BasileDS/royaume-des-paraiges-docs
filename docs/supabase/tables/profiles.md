# Table: profiles

Profils utilisateurs lies a auth.users

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Lignes** | 17 |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `uuid` | Non | gen_random_uuid() | - |
| `created_at` | `timestamp with time zone` | Non | now() | - |
| `attached_establishment_id` | `integer` | Oui | - | - |
| `email` | `text` | Oui | - | Email de l'utilisateur |
| `first_name` | `text` | Oui | - | Prenom |
| `last_name` | `text` | Oui | - | Nom de famille |
| `avatar_url` | `text` | Oui | - | URL de la photo de profil |
| `phone` | `text` | Oui | - | Numero de telephone |
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
