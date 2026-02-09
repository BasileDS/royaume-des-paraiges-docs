# Table: legal_pages

Pages legales de l'application (CGU, politique de confidentialite, etc.). Contenu bilingue FR/EN.

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `uuid` | Non | - | PK |
| `slug` | `text` | Non | - | Identifiant unique (ex: privacy, terms) |
| `title_fr` | `text` | Non | - | Titre en francais |
| `title_en` | `text` | Non | - | Titre en anglais |
| `subtitle_fr` | `text` | Non | - | Sous-titre en francais |
| `subtitle_en` | `text` | Non | - | Sous-titre en anglais |
| `content_fr` | `text` | Non | - | Contenu en francais |
| `content_en` | `text` | Non | - | Contenu en anglais |
| `last_update` | `text` | Oui | - | Date de derniere mise a jour affichee |
| `created_at` | `timestamp with time zone` | Oui | - | Date de creation |
| `updated_at` | `timestamp with time zone` | Oui | - | Date de modification |

## Cles primaires

- `id`
