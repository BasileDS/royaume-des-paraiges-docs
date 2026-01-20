# Table: user_badges

Collection des badges obtenus par chaque utilisateur.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `INTEGER` | ❌ | `serial` | PK auto-incrémentée |
| `customer_id` | `UUID` | ❌ | - | FK vers profiles.id |
| `badge_id` | `INTEGER` | ❌ | - | FK vers badge_types.id |
| `earned_at` | `TIMESTAMPTZ` | ✅ | `now()` | Date d'obtention |
| `period_type` | `VARCHAR` | ✅ | - | Type de période (weekly/monthly/yearly) |
| `period_identifier` | `VARCHAR` | ✅ | - | Identifiant période (ex: 2025-W03) |
| `rank` | `INTEGER` | ✅ | - | Rang obtenu lors de l'attribution |
| `created_at` | `TIMESTAMPTZ` | ✅ | `now()` | Date de création |

## Clés

- **Primary Key** : `id`
- **Foreign Keys** :
  - `customer_id` → `profiles.id`
  - `badge_id` → `badge_types.id`
- **Unique** : `(customer_id, badge_id, period_identifier)`

## Contrainte Unique

Un utilisateur ne peut obtenir qu'un seul badge du même type par période :

```sql
CONSTRAINT user_badges_customer_id_badge_id_period_identifier_key
  UNIQUE (customer_id, badge_id, period_identifier)
```

## Identifiants de Période

| Type | Format | Exemple |
|------|--------|---------|
| weekly | `YYYY-Www` | `2025-W03` |
| monthly | `YYYY-MM` | `2025-01` |
| yearly | `YYYY` | `2025` |

## Récupération des Badges

Utilisez la fonction `get_user_badges()` pour récupérer les badges avec leurs détails :

```sql
SELECT * FROM get_user_badges('customer_id'::UUID);
```

Retourne :

| Colonne | Description |
|---------|-------------|
| badge_id | ID du type de badge |
| slug | Identifiant du badge |
| name | Nom du badge |
| description | Description |
| icon | Icône |
| rarity | Rareté |
| category | Catégorie |
| earned_at | Date d'obtention |
| period_type | Type de période |
| period_identifier | Identifiant période |
| rank | Rang obtenu |

## Exemple d'Utilisation

```typescript
// Récupérer les badges d'un utilisateur via RPC
const { data: badges } = await supabase.rpc('get_user_badges', {
  p_customer_id: userId
});

// Ou via requête directe avec jointure
const { data: badges } = await supabase
  .from('user_badges')
  .select(`
    *,
    badge_types (
      slug,
      name,
      description,
      icon,
      rarity,
      category
    )
  `)
  .eq('customer_id', userId)
  .order('earned_at', { ascending: false });

// Compter les badges par rareté
const badgesByRarity = badges?.reduce((acc, b) => {
  const rarity = b.badge_types.rarity;
  acc[rarity] = (acc[rarity] || 0) + 1;
  return acc;
}, {});
```

## Notes

- Les badges sont attribués automatiquement par `distribute_leaderboard_rewards()`
- Un badge ne peut pas être retiré une fois attribué
- La contrainte unique empêche les doublons pour la même période
