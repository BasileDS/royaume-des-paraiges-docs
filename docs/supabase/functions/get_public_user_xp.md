# Function: get_public_user_xp

Retourne le total d'XP all-time d'un utilisateur donné. Donnée publique (visible sur les profils sociaux).

Wrapper sécurisé de la MV `user_stats`, qui n'est plus directement lisible via PostgREST depuis la migration `security_revoke_user_stats_matview` (18/05/2026).

## Signature

```sql
CREATE FUNCTION public.get_public_user_xp(p_customer_id UUID)
RETURNS TABLE (total_xp BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
```

## Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `p_customer_id` | `UUID` | Oui | ID utilisateur (`profiles.id`) |

## Retour

- 1 ligne `(total_xp)` si l'utilisateur a au moins 1 gain.
- Tableau vide sinon.

## Autorisations

- `GRANT EXECUTE TO anon, authenticated` — donnée publique.

## Consommateurs

- `royaume-paraiges-front/src/features/auth/services/clientService.ts` — affichage de l'XP sur les profils sociaux d'autres utilisateurs.

## Notes

- Pour les **stats privées d'un user** (cashback, niveau, etc.) côté admin/employee : utiliser `get_user_stats(p_customer_id)` (check rôle interne).
- **Migration introductrice** : `security_user_stats_rpc_wrappers` (18/05/2026).
