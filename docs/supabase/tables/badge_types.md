# Table: badge_types

Définitions des badges disponibles dans le système de gamification.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `INTEGER` | ❌ | `serial` | PK auto-incrémentée |
| `slug` | `VARCHAR` | ❌ | - | Identifiant unique (ex: weekly_champion) |
| `name` | `VARCHAR` | ❌ | - | Nom affiché |
| `description` | `TEXT` | ✅ | - | Description du badge |
| `icon` | `VARCHAR` | ✅ | - | Icône/emoji du badge |
| `rarity` | `VARCHAR` | ✅ | - | Rareté (common/rare/epic/legendary) |
| `category` | `VARCHAR` | ✅ | - | Catégorie (weekly/monthly/yearly/special) |
| `created_at` | `TIMESTAMPTZ` | ✅ | `now()` | Date de création |

## Clés

- **Primary Key** : `id`
- **Unique** : `slug`

## Contraintes de Vérification

```sql
-- Rareté
CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))

-- Catégorie
CHECK (category IN ('weekly', 'monthly', 'yearly', 'special'))
```

## Badges Prédéfinis

| Slug | Nom | Rareté | Catégorie | Description |
|------|-----|--------|-----------|-------------|
| `weekly_champion` | Champion Hebdo | legendary | weekly | 1ère place du classement hebdomadaire |
| `weekly_podium_2_3` | Podium Hebdo | epic | weekly | 2ème ou 3ème place hebdomadaire |
| `weekly_top_10` | Top 10 Hebdo | rare | weekly | Top 10 du classement hebdomadaire |
| `monthly_champion` | Champion Mensuel | legendary | monthly | 1ère place du classement mensuel |
| `monthly_podium_2_3` | Podium Mensuel | epic | monthly | 2ème ou 3ème place mensuelle |
| `monthly_top_10` | Top 10 Mensuel | rare | monthly | Top 10 du classement mensuel |
| `yearly_champion` | Champion Annuel | legendary | yearly | 1ère place du classement annuel |
| `yearly_podium_2_3` | Podium Annuel | epic | yearly | 2ème ou 3ème place annuelle |
| `yearly_top_10` | Top 10 Annuel | rare | yearly | Top 10 du classement annuel |

## Attribution de Badge

Les badges sont attribués via `award_user_badge()` :

```sql
SELECT award_user_badge(
  p_customer_id := '...'::UUID,
  p_badge_slug := 'weekly_champion',
  p_period_type := 'weekly',
  p_period_identifier := '2025-W03',
  p_rank := 1
);
```

## Exemple d'Utilisation

```typescript
// Récupérer tous les types de badges
const { data: badges } = await supabase
  .from('badge_types')
  .select('*')
  .order('rarity', { ascending: true });

// Récupérer les badges par catégorie
const { data: weeklyBadges } = await supabase
  .from('badge_types')
  .select('*')
  .eq('category', 'weekly');
```

## Notes

- Cette table est en lecture seule pour les utilisateurs
- Les slugs sont utilisés dans le code pour identifier les badges
- Les badges sont créés manuellement par les administrateurs
