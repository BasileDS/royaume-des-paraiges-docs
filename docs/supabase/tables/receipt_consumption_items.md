# Table: receipt_consumption_items

Tracking optionnel des types de consommation associes a un ticket. Permet de savoir **ce que** le client a consomme (ex: 3 bieres + 1 cocktail) pour preparer les futures promotions.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `BIGINT` | NOT NULL | IDENTITY | Cle primaire |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `now()` | Date de creation |
| `receipt_id` | `BIGINT` | NOT NULL | - | FK vers `receipts.id` |
| `consumption_type` | `consumption_type` | NOT NULL | - | Type de consommation (ENUM) |
| `quantity` | `INTEGER` | NOT NULL | - | Quantite (> 0) |

## ENUM `consumption_type`

| Valeur | Description |
|--------|-------------|
| `cocktail` | Cocktails |
| `biere` | Bieres |
| `alcool` | Alcools (hors biere/cocktail) |
| `soft` | Boissons sans alcool |
| `boisson_chaude` | Cafe, the, chocolat, etc. |
| `restauration` | Nourriture |

## Contraintes

| Contrainte | Type | Description |
|------------|------|-------------|
| `receipt_consumption_items_pkey` | PRIMARY KEY | `id` |
| `receipt_consumption_items_receipt_id_fkey` | FOREIGN KEY | `receipt_id` → `receipts(id)` ON DELETE CASCADE |
| `receipt_consumption_items_quantity_check` | CHECK | `quantity > 0` |

## Index

| Index | Colonnes | Description |
|-------|----------|-------------|
| `idx_receipt_consumption_items_receipt_id` | `receipt_id` | Recherche par ticket |
| `idx_receipt_consumption_items_consumption_type` | `consumption_type` | Recherche par type de consommation |

## Politiques RLS

RLS active. 3 politiques SELECT-only (meme pattern que `receipt_lines`).

| Policy | Operation | Condition |
|--------|-----------|-----------|
| Clients can view their own receipt_consumption_items | SELECT | Via `receipts.customer_id = auth.uid()` |
| Establishments can view their receipt_consumption_items | SELECT | `role = 'establishment'` |
| Admins can view all receipt_consumption_items | SELECT | `role = 'admin'` |

> **Note** : L'insertion est geree exclusivement par la fonction `create_receipt()` (SECURITY DEFINER, bypass RLS).

## Relation avec `create_receipt()`

Les consumption items sont inseres via le parametre optionnel `p_consumption_items JSONB` de la fonction `create_receipt()`.

### Format du parametre

```json
[
  {"type": "biere", "quantity": 3},
  {"type": "cocktail", "quantity": 1}
]
```

## Derniere mise a jour

- **Date**: 2026-02-19
