# Function: calculate_gains

Calcule les XP et le cashback pour un montant donné.

## Signature

```sql
CREATE FUNCTION calculate_gains(
  p_amount_for_gains INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
```

## Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `p_amount_for_gains` | `INTEGER` | ✅ | Montant éligible en centimes |

## Retour

### Succès

```json
{
  "valid": true,
  "xp_gained": 150,
  "cashback_gained": 75,
  "xp_rate": 10,
  "cashback_rate": 5
}
```

### Montant nul ou négatif

```json
{
  "valid": true,
  "xp_gained": 0,
  "cashback_gained": 0,
  "xp_rate": 0,
  "cashback_rate": 0
}
```

### Erreur (constantes manquantes)

```json
{
  "valid": false,
  "error": "Constantes manquantes dans la table constants (xp_gains ou cashback_percentage)"
}
```

## Formules de Calcul

Les taux sont récupérés depuis la table `constants` :

| Clé | Valeur par défaut | Description |
|-----|-------------------|-------------|
| `xp_gains` | 10 | XP par euro |
| `cashback_percentage` | 5 | % de cashback |

### XP

```
XP = (montant_en_centimes / 100) × xp_rate
XP = ROUND(XP)
```

### Cashback

```
Cashback = montant_en_centimes × (cashback_rate / 100)
Cashback = ROUND(Cashback)
```

## Exemples de Calcul

| Montant (centimes) | Montant (€) | XP | Cashback |
|--------------------|-------------|-----|----------|
| 1000 | 10€ | 100 | 50 (0,50€) |
| 1500 | 15€ | 150 | 75 (0,75€) |
| 2500 | 25€ | 250 | 125 (1,25€) |
| 5000 | 50€ | 500 | 250 (2,50€) |
| 10000 | 100€ | 1000 | 500 (5,00€) |

## Utilisation dans create_receipt

Cette fonction est appelée par `create_receipt()` après la validation des paiements :

```sql
-- Seuls les paiements card/cash génèrent des gains
v_gains_calculation := calculate_gains(v_amount_for_gains);

IF NOT (v_gains_calculation->>'valid')::BOOLEAN THEN
  RAISE EXCEPTION '%', v_gains_calculation->>'error';
END IF;

v_xp_base := (v_gains_calculation->>'xp_gained')::INTEGER;
v_cashback_base := (v_gains_calculation->>'cashback_gained')::INTEGER;

-- Application des coefficients profil
v_xp_gained := ROUND((v_xp_base * v_xp_coefficient)::NUMERIC / 100);
v_cashback_gained := ROUND((v_cashback_base * v_cashback_coefficient)::NUMERIC / 100);
```

## Exemple Direct

```sql
-- Calcul pour 25€ (2500 centimes)
SELECT calculate_gains(2500);
-- Résultat: {"valid": true, "xp_gained": 250, "cashback_gained": 125, ...}

-- Calcul pour 0€
SELECT calculate_gains(0);
-- Résultat: {"valid": true, "xp_gained": 0, "cashback_gained": 0, ...}
```

## Notes

- Les montants sont en **centimes**
- Les résultats sont arrondis à l'entier le plus proche
- Les coefficients profil ne sont PAS appliqués par cette fonction
- Si le montant est ≤ 0, retourne 0 gains (pas d'erreur)
