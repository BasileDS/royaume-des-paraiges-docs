# Table: reward_tiers

Paliers de récompenses pour le leaderboard. Définit quelles récompenses sont attribuées selon le rang et la période.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `BIGINT` | Non | `identity` | PK auto-incrémentée |
| `name` | `VARCHAR(100)` | Non | - | Nom du palier (ex: "Champion", "Podium") |
| `rank_from` | `INTEGER` | Non | - | Rang minimum (inclus) |
| `rank_to` | `INTEGER` | Non | - | Rang maximum (inclus) |
| `coupon_template_id` | `BIGINT` | Oui | - | FK vers coupon_templates.id |
| `badge_type_id` | `BIGINT` | Oui | - | FK vers badge_types.id |
| `period_type` | `VARCHAR(20)` | Non | - | Type de période |
| `display_order` | `INTEGER` | Non | `0` | Ordre d'affichage |
| `is_active` | `BOOLEAN` | Non | `true` | Palier actif ? |
| `created_at` | `TIMESTAMPTZ` | Non | `now()` | Date de création |
| `updated_at` | `TIMESTAMPTZ` | Non | `now()` | Date de modification |

## Clés

- **Primary Key** : `id` (BIGINT, identity)
- **Foreign Key** : `coupon_template_id` → `coupon_templates.id`
- **Foreign Key** : `badge_type_id` → `badge_types.id`

## Contraintes

```sql
CHECK (period_type IN ('weekly', 'monthly', 'yearly'))
```

## Tiers par Défaut

### Hebdomadaires (weekly)

| Nom | Rangs | Template | Badge |
|-----|-------|----------|-------|
| Champion Hebdo | 1 | Récompense Champion (10€) | - |
| Podium Hebdo | 2-3 | Récompense Podium (5€) | - |
| Top 10 Hebdo | 4-10 | Récompense Top 10 (10%) | - |

### Mensuels (monthly)

| Nom | Rangs | Template | Badge |
|-----|-------|----------|-------|
| Champion Mensuel | 1 | Récompense Champion (10€) | - |
| Podium Mensuel | 2-3 | Récompense Podium (5€) | - |
| Top 10 Mensuel | 4-10 | Récompense Top 10 (10%) | - |

### Annuels (yearly)

| Nom | Rangs | Template | Badge |
|-----|-------|----------|-------|
| Champion Annuel | 1 | Récompense Champion (10€) | - |
| Podium Annuel | 2-3 | Récompense Podium (5€) | - |
| Top 10 Annuel | 4-10 | Récompense Top 10 (10%) | - |

## Utilisation

### Récupérer les tiers avec leurs templates

```typescript
const { data: tiers } = await supabase
  .from('reward_tiers')
  .select(`
    *,
    coupon_template:coupon_template_id (
      name,
      amount,
      percentage,
      validity_days
    ),
    badge_type:badge_type_id (
      name,
      slug,
      icon_url
    )
  `)
  .eq('period_type', 'weekly')
  .eq('is_active', true)
  .order('display_order');
```

### Trouver le tier pour un rang donné

```sql
SELECT * FROM reward_tiers
WHERE period_type = 'weekly'
  AND is_active = true
  AND rank_from <= 5
  AND rank_to >= 5;
-- Retourne le tier pour le rang 5 (Top 10 Hebdo)
```

### Créer un nouveau tier

```sql
INSERT INTO reward_tiers (name, rank_from, rank_to, coupon_template_id, period_type, display_order)
VALUES ('Top 20 Hebdo', 11, 20, 3, 'weekly', 4);
```

## Relations

```
coupon_templates ──► reward_tiers (coupon_template_id)
badge_types ──────► reward_tiers (badge_type_id)

reward_tiers ──► coupon_distribution_logs (tier_id)
```

## Politiques RLS

| Policy | Opération | Condition |
|--------|-----------|-----------|
| Admin full access | ALL | `role = 'admin'` |

Seuls les administrateurs peuvent gérer les paliers de récompenses.

## Logique de Distribution

Lors de la distribution des récompenses (`distribute_period_rewards_v2`) :

1. Récupération du leaderboard de la période
2. Pour chaque utilisateur dans le TOP 10 :
   - Trouver le tier correspondant à son rang
   - Créer le coupon depuis le template associé
   - Attribuer le badge si configuré
   - Logger dans `coupon_distribution_logs`

## Notes

- Les plages de rangs ne doivent pas se chevaucher pour une même période
- Un tier peut avoir un coupon ET/OU un badge
- L'ordre d'affichage permet de trier les tiers dans l'interface admin
- Désactiver un tier (`is_active = false`) l'exclut des distributions
