# Table: notes — ⚠️ SUPPRIMÉE

> **Cette table a été supprimée** par la migration `security_drop_orphan_notes_table` (18 mai 2026, hardening sécurité post-migration IPDEV). Elle avait 0 ligne et aucune référence applicative.
>
> Ce fichier est conservé pour archive. Ne pas réutiliser le nom `notes` sans alignement explicite avec l'équipe — la table était orpheline (jamais utilisée en production), pas une vraie fonctionnalité métier.

## Schéma historique (pour référence uniquement)

| Colonne | Type | Nullable | Default |
|---------|------|----------|---------|
| `id` | `bigint` | Non | - |
| `created_at` | `timestamp with time zone` | Non | `now()` |
| `customer_id` | `uuid` | Non | `auth.uid()` |
| `note` | `integer` | Non | - |

FK : `notes_customer_id_fkey` (`customer_id` → `profiles.id`).
