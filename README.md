# Documentation - Royaume des Paraiges

Ce repository contient la documentation technique de l'application **Royaume des Paraiges**.

## Structure

```
docs/
├── claude/      # Guide de developpement IA
├── qrcode/      # Documentation QR codes (generation + scan)
├── rgpd/        # Documentation RGPD (registre, droits, securite)
└── supabase/    # Documentation Supabase (Backend & BDD)

scripts/         # Scripts utilitaires
└── sync-supabase-docs.mjs  # Synchronisation auto documentation Supabase
```

## Utilisation comme Submodule

Pour ajouter ce repository comme submodule dans votre projet principal :

```bash
git submodule add https://github.com/VOTRE_USERNAME/royaume-des-paraiges-docs.git docs
```

Pour cloner un projet avec ses submodules :

```bash
git clone --recurse-submodules https://github.com/VOTRE_USERNAME/royaume-des-paraiges.git
```

Pour mettre à jour le submodule :

```bash
git submodule update --remote docs
```

## Sections

### Claude
Documentation relative à l'intégration et l'utilisation de Claude AI dans l'application.

### Supabase
Documentation de la base de données, authentification, et services backend Supabase.

### QR codes
Documentation sur la génération et le scan des QR codes (PWA scanner, format).

### RGPD
Registre des traitements, droits utilisateurs, durées de conservation, sécurité, sous-traitants.

### Scripts

Scripts utilitaires pour la gestion de la documentation.

#### Synchronisation Supabase

Le script `sync-supabase-docs.mjs` permet de synchroniser automatiquement la documentation Supabase avec la configuration reelle du projet.

```bash
# Prerequis: Token API Management Supabase présent en variablie d'environnement

# Verifier les differences (dry-run)
node scripts/sync-supabase-docs.mjs --dry-run

# Appliquer les mises a jour
node scripts/sync-supabase-docs.mjs
```

Voir [scripts/README.md](./scripts/README.md) pour plus de details.
