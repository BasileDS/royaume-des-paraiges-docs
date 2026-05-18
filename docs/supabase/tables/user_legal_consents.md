# Table: user_legal_consents

Journal d'acceptation versionnée des documents légaux. Une ligne par (utilisateur, document, version) acceptée. Sert à détecter si un utilisateur doit re-accepter à cause d'un bump de version (voir `LEGAL-UPDATE-PROCEDURE.md` à la racine du workspace).

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | `public` |
| **RLS** | Active |
| **Immutable** | Oui — pas de policy UPDATE/DELETE, audit-only |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `uuid` | Non | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | Non | - | FK vers `auth.users.id` (ON DELETE CASCADE) |
| `document_slug` | `text` | Non | - | Identifiant du document (`cgu`, `politique-de-confidentialite`) |
| `version` | `text` | Non | - | Version acceptée (ex: `v1.0`) — doit matcher `legal_pages.version` au moment de l'acceptation |
| `accepted_at` | `timestamptz` | Non | `NOW()` | Horodatage de l'acceptation |
| `ip_address` | `inet` | Oui | - | IP cliente au moment de l'acceptation (audit) |
| `user_agent` | `text` | Oui | - | User-Agent au moment de l'acceptation (audit) |

## Cles primaires

- `id`

## Index

- UNIQUE `(user_id, document_slug, version)` (`user_legal_consents_unique`) — idempotence du `INSERT` côté front
- `(user_id)` — lookup des consents d'un utilisateur
- `(document_slug, version)` — métriques de re-acceptation par version

## Relations (Foreign Keys)

- `user_id` → `auth.users.id` (**ON DELETE CASCADE** — RGPD : suppression du compte = suppression du journal de consents)

## RLS Policies

- `Users can view their own consents` — SELECT WHERE `auth.uid() = user_id`
- `Users can insert their own consents` — INSERT WITH CHECK `auth.uid() = user_id`
- **Pas de UPDATE/DELETE** : un consent est un enregistrement d'audit immuable.

## Notes

- **Historique** : créée à l'origine par la migration `034_legal_versioning_and_consents` (15 mai 2026). Perdue au `pg_dump` du 13 mai → migration IPDEV. Restaurée par la migration `restore_legal_versioning_structure` (18 mai 2026) avec backfill v1.0 depuis `profiles.terms_accepted_at` (filtré par jointure `auth.users` pour ignorer les profils anonymisés RGPD).
- **Bump de version** : voir [`LEGAL-UPDATE-PROCEDURE.md`](../../../../LEGAL-UPDATE-PROCEDURE.md) à la racine du workspace. Tout `UPDATE legal_pages.version` force la re-acceptation au prochain login client (le front compare `legal_pages.version` et `MAX(user_legal_consents.version)` par slug).
- **Service consommateur** : `royaume-paraiges-front/src/features/auth/services/legalService.ts` (méthodes `getRequiredConsents`, `recordConsent`, `recordAllRequiredConsents`).
