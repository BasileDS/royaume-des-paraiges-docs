# Table: period_reward_configs

Configuration personnalisée des récompenses pour une période spécifique. Permet de surcharger les `reward_tiers` par défaut.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `BIGINT` | Non | `identity` | PK auto-incrémentée |
| `period_type` | `VARCHAR(20)` | Non | - | Type de période |
| `period_identifier` | `VARCHAR(20)` | Non | - | Identifiant de période |
| `custom_tiers` | `JSONB` | Oui | - | Configuration personnalisée des tiers |
| `status` | `VARCHAR(20)` | Non | `'pending'` | Statut de la distribution |
| `distributed_at` | `TIMESTAMPTZ` | Oui | - | Date de distribution |
| `distributed_by` | `UUID` | Oui | - | FK vers profiles.id (admin) |
| `notes` | `TEXT` | Oui | - | Notes administrateur |
| `created_at` | `TIMESTAMPTZ` | Non | `now()` | Date de création |
| `updated_at` | `TIMESTAMPTZ` | Non | `now()` | Date de modification |

## Clés

- **Primary Key** : `id` (BIGINT, identity)
- **Foreign Key** : `distributed_by` → `profiles.id`
- **Unique** : `(period_type, period_identifier)`

## Contraintes

```sql
CHECK (period_type IN ('weekly', 'monthly', 'yearly'))
CHECK (status IN ('pending', 'distributed', 'cancelled'))
```

## Format des Identifiants de Période

| Type | Format | Exemple |
|------|--------|---------|
| `weekly` | `YYYY-Www` | `2026-W04` |
| `monthly` | `YYYY-MM` | `2026-01` |
| `yearly` | `YYYY` | `2026` |

## Statuts

| Statut | Description |
|--------|-------------|
| `pending` | Distribution non effectuée |
| `distributed` | Récompenses distribuées |
| `cancelled` | Distribution annulée |

## Structure custom_tiers (JSONB)

Permet de personnaliser les récompenses pour une période spécifique :

```json
[
  {
    "rank_from": 1,
    "rank_to": 1,
    "coupon_template_id": 5,
    "badge_type_id": 2
  },
  {
    "rank_from": 2,
    "rank_to": 5,
    "coupon_template_id": 3,
    "badge_type_id": null
  }
]
```

Si `custom_tiers` est NULL, les `reward_tiers` par défaut sont utilisés.

## Utilisation

### Créer une config pour une période spéciale

```sql
INSERT INTO period_reward_configs (period_type, period_identifier, notes)
VALUES ('weekly', '2026-W05', 'Semaine spéciale anniversaire');
```

### Vérifier le statut d'une période

```typescript
const { data: config } = await supabase
  .from('period_reward_configs')
  .select('*')
  .eq('period_type', 'weekly')
  .eq('period_identifier', '2026-W04')
  .single();

if (config?.status === 'distributed') {
  console.log('Récompenses déjà distribuées');
}
```

### Récupérer les périodes en attente

```typescript
const { data: pending } = await supabase
  .from('period_reward_configs')
  .select('*')
  .eq('status', 'pending')
  .order('period_identifier', { ascending: false });
```

### Marquer une période comme distribuée

```sql
UPDATE period_reward_configs
SET
  status = 'distributed',
  distributed_at = now(),
  distributed_by = 'admin-uuid'
WHERE period_type = 'weekly'
  AND period_identifier = '2026-W04';
```

## Relations

```
profiles ──► period_reward_configs (distributed_by)
```

## Politiques RLS

| Policy | Opération | Condition |
|--------|-----------|-----------|
| Admin full access | ALL | `role = 'admin'` |

Seuls les administrateurs peuvent gérer les configurations de période.

## Workflow de Distribution

1. **Automatique (cron)** : Si pas de config existante, utilise les `reward_tiers` par défaut
2. **Manuel (admin)** :
   - Créer une config avec `custom_tiers` si personnalisation nécessaire
   - Prévisualiser via `get_period_preview()`
   - Déclencher la distribution via `distribute_period_rewards_v2()`
   - Le statut passe automatiquement à `distributed`

## Notes

- Une seule config par combinaison (period_type, period_identifier)
- Les jobs cron créent automatiquement une config si elle n'existe pas
- Le champ `notes` permet de documenter les décisions admin
- `cancelled` permet d'empêcher la distribution automatique
