# Function: handle_new_user

Fonction trigger qui crée automatiquement un profil dans `public.profiles` lors de la création d'un utilisateur dans `auth.users`.

## Signature

```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
```

## Trigger Associé

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## Logique de Génération du Username

1. **Si métadonnées disponibles** (first_name, last_name) :
   - Username = première lettre du prénom + nom complet
   - Exemple : "Jean Dupont" → "jdupont"

2. **Sinon** (inscription par email) :
   - Username = partie avant le @ de l'email
   - Exemple : "jean.dupont@email.com" → "jeandupont"

3. **Unicité** :
   - Si le username existe déjà, ajout d'un compteur
   - Exemple : "jdupont" existe → "jdupont1", "jdupont2", etc.

## Données Extraites

| Source | Champ profil |
|--------|--------------|
| `NEW.id` | `id` |
| `NEW.email` | `email` |
| `NEW.raw_user_meta_data->>'first_name'` | `first_name` |
| `NEW.raw_user_meta_data->>'last_name'` | `last_name` |
| `NEW.raw_user_meta_data->>'avatar_url'` | `avatar_url` |
| `NEW.phone` ou `raw_user_meta_data->>'phone'` | `phone` |
| `NEW.raw_user_meta_data->>'birthdate'` | `birthdate` |
| `NEW.raw_user_meta_data->>'attached_establishment_id'` | `attached_establishment_id` |
| `NEW.created_at` | `created_at` |
| Généré | `username` |

## Exemple d'Inscription

### Avec métadonnées

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'jean.dupont@email.com',
  password: 'password123',
  options: {
    data: {
      first_name: 'Jean',
      last_name: 'Dupont',
      phone: '+33612345678',
      birthdate: '1990-05-15'
    }
  }
});
```

Profil créé :
```json
{
  "id": "uuid-de-auth-users",
  "email": "jean.dupont@email.com",
  "username": "jdupont",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "+33612345678",
  "birthdate": "1990-05-15",
  "role": "client",
  "xp_coefficient": 100,
  "cashback_coefficient": 100
}
```

### Sans métadonnées

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'utilisateur@email.com',
  password: 'password123'
});
```

Profil créé :
```json
{
  "id": "uuid-de-auth-users",
  "email": "utilisateur@email.com",
  "username": "utilisateur",
  "first_name": null,
  "last_name": null,
  "role": "client"
}
```

## Gestion des Erreurs

En cas d'erreur lors de la création du profil, le trigger échoue et l'inscription dans `auth.users` est annulée (rollback).

## Notes

- Le trigger s'exécute en `SECURITY DEFINER` pour pouvoir insérer dans `profiles`
- Le `role` est toujours `'client'` par défaut
- Les coefficients sont initialisés à `100` (1x)
- Le username est nettoyé (caractères spéciaux supprimés, minuscules)
