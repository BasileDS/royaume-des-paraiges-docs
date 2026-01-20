# Table: profiles

Profils utilisateurs de l'application. Lié 1:1 avec `auth.users`.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `UUID` | ❌ | `gen_random_uuid()` | PK, correspond à auth.users.id |
| `created_at` | `TIMESTAMPTZ` | ❌ | `now()` | Date de création |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `now()` | Date de mise à jour |
| `email` | `TEXT` | ✅ | - | Email (synchronisé depuis auth.users) |
| `username` | `TEXT` | ✅ | - | Nom d'utilisateur unique |
| `first_name` | `TEXT` | ✅ | - | Prénom |
| `last_name` | `TEXT` | ✅ | - | Nom de famille |
| `avatar_url` | `TEXT` | ✅ | - | URL de la photo de profil |
| `phone` | `TEXT` | ✅ | - | Numéro de téléphone |
| `birthdate` | `DATE` | ✅ | - | Date de naissance |
| `role` | `user_role` | ❌ | `'client'` | Rôle (client/employee/establishment/admin) |
| `attached_establishment_id` | `INTEGER` | ✅ | - | ID établissement Directus (pour employees) |
| `xp_coefficient` | `INTEGER` | ❌ | `100` | Coefficient multiplicateur XP (100 = 1x) |
| `cashback_coefficient` | `INTEGER` | ❌ | `100` | Coefficient multiplicateur cashback (100 = 1x) |

## Clés

- **Primary Key** : `id`
- **Unique** : `username`
- **Foreign Key** : `id` référence `auth.users.id` (implicite via trigger)

## Relations

### Référencé par

| Table | Colonne | Relation |
|-------|---------|----------|
| `likes` | `user_id` | 1:N |
| `comments` | `customer_id` | 1:N |
| `notes` | `customer_id` | 1:N |
| `coupons` | `customer_id` | 1:N |
| `receipts` | `customer_id` | 1:N |
| `spendings` | `customer_id` | 1:N |
| `user_badges` | `customer_id` | 1:N |
| `leaderboard_reward_distributions` | `customer_id` | 1:N |

## Triggers Associés

Le profil est créé automatiquement via le trigger `handle_new_user` sur `auth.users` :

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## Coefficients XP et Cashback

Les coefficients permettent de modifier les gains pour certains utilisateurs :

| Coefficient | Multiplicateur | Exemple |
|-------------|----------------|---------|
| `50` | 0.5x | Gains réduits de moitié |
| `100` | 1x | Gains normaux (défaut) |
| `150` | 1.5x | +50% de gains |
| `200` | 2x | Gains doublés |

**Calcul** : `gain_final = gain_base * coefficient / 100`

## Rôles et Permissions

| Rôle | Description | Permissions spéciales |
|------|-------------|----------------------|
| `client` | Utilisateur standard | Voir ses propres données |
| `employee` | Employé d'établissement | Créer des receipts |
| `establishment` | Compte établissement | Voir tous les receipts, créer coupons |
| `admin` | Administrateur | Accès complet |

## Exemple d'Utilisation

```typescript
// Récupérer le profil de l'utilisateur connecté
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// Mettre à jour le profil
const { error } = await supabase
  .from('profiles')
  .update({ first_name: 'Jean', last_name: 'Dupont' })
  .eq('id', user.id);
```

## SQL de Création

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  email TEXT,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  birthdate DATE,
  role user_role NOT NULL DEFAULT 'client',
  attached_establishment_id INTEGER,
  xp_coefficient INTEGER NOT NULL DEFAULT 100,
  cashback_coefficient INTEGER NOT NULL DEFAULT 100
);

-- Commentaires
COMMENT ON COLUMN profiles.email IS 'Email de l''utilisateur (synchronisé depuis auth.users)';
COMMENT ON COLUMN profiles.first_name IS 'Prénom (peut être extrait de full_name)';
COMMENT ON COLUMN profiles.last_name IS 'Nom de famille (peut être extrait de full_name)';
COMMENT ON COLUMN profiles.avatar_url IS 'URL de la photo de profil';
COMMENT ON COLUMN profiles.phone IS 'Numéro de téléphone';
COMMENT ON COLUMN profiles.birthdate IS 'Date de naissance';
```
