# Table: coupon_templates

Modèles de coupons réutilisables pour le système de récompenses administrable.

## Structure

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | `BIGINT` | Non | `identity` | PK auto-incrémentée |
| `name` | `VARCHAR(255)` | Non | - | Nom du template |
| `description` | `TEXT` | Oui | - | Description du template |
| `amount` | `INTEGER` | Oui | - | Montant fixe en centimes (ex: 1000 = 10€) |
| `percentage` | `INTEGER` | Oui | - | Pourcentage de réduction (ex: 15 = 15%) |
| `establishment_id` | `INTEGER` | Oui | - | FK vers établissement (NULL = tous) |
| `validity_days` | `INTEGER` | Oui | - | Jours de validité après attribution |
| `is_active` | `BOOLEAN` | Non | `true` | Template actif ? |
| `created_at` | `TIMESTAMPTZ` | Non | `now()` | Date de création |
| `updated_at` | `TIMESTAMPTZ` | Non | `now()` | Date de modification |
| `created_by` | `UUID` | Oui | - | FK vers profiles.id (admin créateur) |

## Clés

- **Primary Key** : `id` (BIGINT, identity)
- **Foreign Key** : `created_by` → `profiles.id`
- **Foreign Key** : `establishment_id` → `establishments.id` (si applicable)

## Contraintes

- Un template a SOIT un `amount`, SOIT un `percentage`, jamais les deux
- `validity_days` NULL signifie pas d'expiration

## Templates par Défaut

| Nom | Montant | Pourcentage | Validité | Description |
|-----|---------|-------------|----------|-------------|
| Coupon Hebdo 50€ | 390 (3,90€) | - | 30 jours | Récompense 50€ de dépenses hebdo |
| Coupon Fréquence 5% | - | 5% | 30 jours | Récompense 10 tickets de caisse |
| Récompense Champion | 1000 (10€) | - | 60 jours | 1er du classement |
| Récompense Podium | 500 (5€) | - | 45 jours | 2ème et 3ème du classement |
| Récompense Top 10 | - | 10% | 30 jours | 4ème à 10ème du classement |

## Utilisation

### Créer un template

```sql
INSERT INTO coupon_templates (name, description, amount, validity_days, is_active)
VALUES ('Mon Template', 'Description', 500, 30, true);
```

### Récupérer les templates actifs

```typescript
const { data: templates } = await supabase
  .from('coupon_templates')
  .select('*')
  .eq('is_active', true)
  .order('name');
```

### Créer un coupon depuis un template

```sql
SELECT create_manual_coupon(
  p_customer_id := 'user-uuid',
  p_template_id := 1,
  p_admin_id := 'admin-uuid'
);
```

## Relations

```
coupon_templates
    │
    ├──► reward_tiers (coupon_template_id)
    ├──► coupons (template_id)
    └──► coupon_distribution_logs (coupon_template_id)
```

## Politiques RLS

| Policy | Opération | Condition |
|--------|-----------|-----------|
| Admin full access | ALL | `role = 'admin'` |

Seuls les administrateurs peuvent créer, modifier et supprimer des templates.

## Notes

- Les templates permettent de standardiser les coupons distribués
- Modifier un template n'affecte pas les coupons déjà créés
- Le champ `establishment_id` permet de restreindre un coupon à un établissement
