# Table: comments

Commentaires des utilisateurs sur différents types de contenus.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `BIGINT` | ❌ | `identity` | PK auto-incrémentée |
| `created_at` | `TIMESTAMPTZ` | ❌ | `now()` | Date de création |
| `customer_id` | `UUID` | ❌ | - | FK vers profiles.id |
| `content` | `TEXT` | ✅ | - | Contenu du commentaire |
| `hidden` | `BOOLEAN` | ❌ | `false` | Commentaire masqué (modération) |
| `beer_id` | `INTEGER` | ✅ | - | ID bière (Directus) |
| `news_id` | `INTEGER` | ✅ | - | ID news (Directus) |
| `quest_id` | `INTEGER` | ✅ | - | ID quête (Directus) |
| `establishment_id` | `INTEGER` | ✅ | - | ID établissement (Directus) |

## Clés

- **Primary Key** : `id` (BIGINT, identity)
- **Foreign Key** : `customer_id` → `profiles.id`

## Modération

Le champ `hidden` permet de masquer des commentaires inappropriés sans les supprimer :

```sql
-- Masquer un commentaire
UPDATE comments SET hidden = true WHERE id = 123;
```

Les commentaires masqués ne sont pas visibles via les policies RLS (sauf pour les admins).

## Exemple d'Utilisation

```typescript
// Récupérer les commentaires d'une bière avec infos utilisateur
const { data: comments } = await supabase
  .from('comments')
  .select(`
    *,
    profiles:customer_id (
      username,
      avatar_url
    )
  `)
  .eq('beer_id', beerId)
  .eq('hidden', false)
  .order('created_at', { ascending: false });

// Ajouter un commentaire
const { error } = await supabase
  .from('comments')
  .insert({
    customer_id: userId,
    beer_id: beerId,
    content: 'Super bière !'
  });

// Modifier son commentaire
const { error } = await supabase
  .from('comments')
  .update({ content: 'Contenu modifié' })
  .eq('id', commentId)
  .eq('customer_id', userId); // Sécurité : uniquement son propre commentaire

// Supprimer son commentaire
const { error } = await supabase
  .from('comments')
  .delete()
  .eq('id', commentId)
  .eq('customer_id', userId);
```

## Notes

- Un commentaire est associé à **un seul** type de contenu
- Les utilisateurs ne peuvent modifier/supprimer que leurs propres commentaires
- Les commentaires `hidden = true` ne sont pas retournés par défaut (RLS)
