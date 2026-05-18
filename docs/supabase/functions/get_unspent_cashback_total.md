# Function: get_unspent_cashback_total

Retourne la somme totale du cashback **disponible** (non dépensé) agrégé sur tous les utilisateurs. Admin only — exposition de la « dette PdB » globale pour les analytics.

## Signature

```sql
CREATE FUNCTION public.get_unspent_cashback_total()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
```

## Paramètres

Aucun.

## Retour

`BIGINT` — total en centimes (1 PdB = 1 centime). Exemple : `12345` = 123,45 €.

## Autorisations

- `GRANT EXECUTE TO authenticated` — accessible aux sessions admin (check rôle interne via `get_current_user_role()`).
- `REVOKE EXECUTE FROM anon`.

## Consommateurs

- `royaume-paraiges-admin/src/lib/services/analyticsService.ts` — métrique « dette PdB » dans la page analytics.

## Notes

- **Remplace** un ancien `from('user_stats').select(...)` côté admin qui agrégait `cashback_available` client-side. Migration vers une RPC pour de meilleures perfs (agrégation côté BDD) et fermeture de la MV `user_stats` à l'API (cf. [`get_public_user_xp`](./get_public_user_xp.md)).
- **Migration introductrice** : `security_user_stats_rpc_wrappers` (18/05/2026).
