# Migrations Supabase - Royaume des Paraiges

Ce dossier contient les scripts de migration SQL pour la base de donnees Supabase.

## Liste des Migrations

| Fichier | Description | Date |
|---------|-------------|------|
| `phase4_data_migration.sql` | Migration systeme de coupons administrable | 2026-01 |

## Comment executer une migration

1. Connectez-vous au [Dashboard Supabase](https://app.supabase.com)
2. Selectionnez le projet `uflgfsoekkgegdgecubb`
3. Allez dans **SQL Editor**
4. Copiez-collez le contenu du fichier de migration
5. Executez le script

## Ordre d'execution

Les migrations doivent etre executees dans l'ordre chronologique. Chaque migration verifie les pre-requis avant de s'executer.

## Migration Phase 4 : Systeme de Coupons Administrable

### Description

Cette migration met en place le nouveau systeme de coupons administrable :

1. **Creation des templates de coupons** (5 templates)
   - Coupon Hebdo 50€ (3.90€)
   - Coupon Frequence 5%
   - Recompense Champion (10€)
   - Recompense Podium (5€)
   - Recompense Top 10 (10%)

2. **Creation des reward_tiers** (9 tiers)
   - 3 tiers hebdomadaires (Champion, Podium, Top 10)
   - 3 tiers mensuels (Champion, Podium, Top 10)
   - 3 tiers annuels (Champion, Podium, Top 10)

3. **Migration des coupons existants**
   - Marquage des anciens coupons avec `distribution_type = 'trigger_legacy'`

### Pre-requis

Avant d'executer cette migration, les tables suivantes doivent exister :
- `coupon_templates`
- `reward_tiers`
- `coupons` (avec colonne `distribution_type`)

### Verification

Apres execution, verifier avec :

```sql
-- Templates crees
SELECT * FROM coupon_templates ORDER BY created_at;

-- Tiers avec templates associes
SELECT
  rt.name,
  rt.rank_from,
  rt.rank_to,
  rt.period_type,
  ct.name as template_name,
  ct.amount,
  ct.percentage
FROM reward_tiers rt
LEFT JOIN coupon_templates ct ON rt.coupon_template_id = ct.id
ORDER BY rt.period_type, rt.display_order;

-- Distribution des coupons par type
SELECT distribution_type, COUNT(*) as count
FROM coupons
GROUP BY distribution_type;
```

## Bonnes Pratiques

1. **Toujours tester en local** avant d'executer en production
2. **Faire une sauvegarde** avant toute migration majeure
3. **Verifier les resultats** avec les requetes de verification fournies
4. **Documenter les changements** dans ce README

## Rollback

En cas de probleme, chaque migration devrait avoir un script de rollback. Contacter l'administrateur de la base de donnees si necessaire.
