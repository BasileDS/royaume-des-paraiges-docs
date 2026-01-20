# Documentation - Royaume des Paraiges

Ce repository contient la documentation technique de l'application **Royaume des Paraiges**.

## Structure

```
docs/
├── claude/      # Guide de developpement IA
├── supabase/    # Documentation Supabase (Backend & BDD)
└── directus/    # Documentation Directus (CMS)

migrations/      # Scripts SQL de migration Supabase
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

### Directus
Documentation du CMS Directus pour la gestion de contenu.

### Migrations
Scripts SQL pour les migrations de la base de donnees Supabase. Voir [migrations/README.md](./migrations/README.md) pour les instructions d'execution.
