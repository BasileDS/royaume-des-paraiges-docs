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
| `last_update` | `text` | Oui | - | Date de derniere mise a jour affichee (UI uniquement) |
| `version` | `text` | Non | `'v1.0'` | Version du document. Toute mise à jour de `version` force la re-acceptation client (voir `user_legal_consents`). |
| `created_at` | `timestamp with time zone` | Oui | - | Date de creation |
| `updated_at` | `timestamp with time zone` | Oui | - | Date de modification |

## Cles primaires

- `id`

## Notes

- **Versionning** : la colonne `version` est lue par le front pour détecter si l'utilisateur connecté doit re-accepter. Toujours bumper `version` lors d'un changement substantiel. Cf. [`LEGAL-UPDATE-PROCEDURE.md`](../../../../LEGAL-UPDATE-PROCEDURE.md). Le journal d'acceptation est dans [`user_legal_consents`](./user_legal_consents.md).
- **Historique colonne `version`** : ajoutée par la migration `034_legal_versioning_and_consents` (15/05/2026), perdue au pg_dump du 13/05, restaurée par `restore_legal_versioning_structure` (18/05/2026) avec valeur par défaut `v1.0`.
