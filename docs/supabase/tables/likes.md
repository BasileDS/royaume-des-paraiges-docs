# Table: likes

Likes des utilisateurs sur différents types de contenus (bières, news, quêtes).

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `BIGINT` | ❌ | `identity` | PK auto-incrémentée |
| `created_at` | `TIMESTAMPTZ` | ❌ | `now()` | Date de création |
| `user_id` | `UUID` | ❌ | - | FK vers profiles.id |
| `beer_id` | `INTEGER` | ✅ | - | ID bière (Directus) |
| `news_id` | `INTEGER` | ✅ | - | ID news (Directus) |
| `quest_id` | `INTEGER` | ✅ | - | ID quête (Directus) |

## Clés

- **Primary Key** : `id` (BIGINT, identity)
- **Foreign Key** : `user_id` → `profiles.id`

## Logique de Like

Un like est associé à **un seul** type de contenu. Les autres colonnes sont `NULL`.

```sql
-- Like sur une bière
INSERT INTO likes (user_id, beer_id) VALUES (user_id, 42);

-- Like sur une news
INSERT INTO likes (user_id, news_id) VALUES (user_id, 15);

-- Like sur une quête
INSERT INTO likes (user_id, quest_id) VALUES (user_id, 7);
```

## Exemple d'Utilisation

```typescript
// Vérifier si l'utilisateur a liké une bière
const { data: liked } = await supabase
  .from('likes')
  .select('id')
  .eq('user_id', userId)
  .eq('beer_id', beerId)
  .maybeSingle();

const isLiked = !!liked;

// Toggle like
if (isLiked) {
  await supabase.from('likes').delete().eq('id', liked.id);
} else {
  await supabase.from('likes').insert({ user_id: userId, beer_id: beerId });
}

// Compter les likes d'une bière
const { count } = await supabase
  .from('likes')
  .select('*', { count: 'exact', head: true })
  .eq('beer_id', beerId);
```

## Notes

- Les IDs (`beer_id`, `news_id`, `quest_id`) font référence à Directus
- Un utilisateur ne peut liker qu'une fois chaque contenu
- La suppression d'un like = "unlike"
