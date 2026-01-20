# Table: constants

Constantes de configuration de l'application.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `key` | `VARCHAR` | ❌ | - | PK, clé unique |
| `value` | `TEXT` | ❌ | - | Valeur (stockée en texte) |

## Clés

- **Primary Key** : `key`

## Constantes Définies

| Clé | Valeur | Description |
|-----|--------|-------------|
| `xp_gains` | `10` | XP gagnés par euro dépensé |
| `cashback_percentage` | `5` | Pourcentage de cashback (5%) |

## Utilisation dans les Fonctions

```sql
-- Dans calculate_gains()
SELECT value::NUMERIC INTO v_xp_rate
FROM constants
WHERE key = 'xp_gains';

SELECT value::NUMERIC INTO v_cashback_rate
FROM constants
WHERE key = 'cashback_percentage';
```

## Calcul des Gains

Avec les constantes actuelles (xp_gains=10, cashback_percentage=5) :

| Montant payé | XP gagnés | Cashback gagné |
|--------------|-----------|----------------|
| 10€ | 100 XP | 0,50€ |
| 25€ | 250 XP | 1,25€ |
| 50€ | 500 XP | 2,50€ |
| 100€ | 1000 XP | 5,00€ |

## Modification des Constantes

```sql
-- Modifier le taux de cashback à 10%
UPDATE constants SET value = '10' WHERE key = 'cashback_percentage';

-- Ajouter une nouvelle constante
INSERT INTO constants (key, value) VALUES ('new_constant', '42');
```

## Exemple d'Utilisation

```typescript
// Récupérer une constante
const { data } = await supabase
  .from('constants')
  .select('value')
  .eq('key', 'cashback_percentage')
  .single();

const cashbackRate = parseFloat(data?.value || '0');

// Récupérer toutes les constantes
const { data: constants } = await supabase
  .from('constants')
  .select('*');

const config = constants?.reduce((acc, c) => {
  acc[c.key] = c.value;
  return acc;
}, {});
```

## Notes

- Les valeurs sont stockées en `TEXT` et doivent être castées selon le besoin
- Seuls les administrateurs peuvent modifier les constantes
- Les changements prennent effet immédiatement pour les nouveaux calculs
