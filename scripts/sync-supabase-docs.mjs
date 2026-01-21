#!/usr/bin/env node

/**
 * Script de synchronisation de la documentation Supabase
 *
 * Ce script compare la configuration actuelle de Supabase avec la documentation locale
 * et met a jour la documentation si des differences sont detectees.
 *
 * Usage:
 *   node scripts/sync-supabase-docs.mjs [options]
 *
 * Options:
 *   --dry-run              Affiche les differences sans modifier les fichiers
 *   --verbose              Affiche des informations detaillees
 *   --from-snapshot FILE   Utilise un fichier snapshot JSON au lieu de l'API
 *   --save-snapshot FILE   Sauvegarde les donnees dans un fichier JSON
 *
 * Variables d'environnement (mode API):
 *   SUPABASE_PROJECT_ID    - ID du projet Supabase
 *   SUPABASE_ACCESS_TOKEN  - Token d'acces API Management Supabase
 *
 * Modes d'utilisation:
 *   1. Avec token API:     SUPABASE_ACCESS_TOKEN=xxx node scripts/sync-supabase-docs.mjs
 *   2. Avec snapshot:      node scripts/sync-supabase-docs.mjs --from-snapshot snapshot.json
 *   3. Generer snapshot:   SUPABASE_ACCESS_TOKEN=xxx node scripts/sync-supabase-docs.mjs --save-snapshot snapshot.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  projectId: process.env.SUPABASE_PROJECT_ID || 'uflgfsoekkgegdgecubb',
  accessToken: process.env.SUPABASE_ACCESS_TOKEN,
  dbUrl: process.env.SUPABASE_DB_URL,
  docsPath: path.resolve(__dirname, '../docs/supabase'),
  apiBaseUrl: 'https://api.supabase.com/v1',
};

// Arguments CLI
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');

// Mode snapshot
const fromSnapshotIdx = args.indexOf('--from-snapshot');
const FROM_SNAPSHOT = fromSnapshotIdx !== -1 ? args[fromSnapshotIdx + 1] : null;

const saveSnapshotIdx = args.indexOf('--save-snapshot');
const SAVE_SNAPSHOT = saveSnapshotIdx !== -1 ? args[saveSnapshotIdx + 1] : null;

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logVerbose(message) {
  if (VERBOSE) {
    console.log(`${colors.cyan}[DEBUG] ${message}${colors.reset}`);
  }
}

// ============================================================================
// API Supabase Management
// ============================================================================

async function fetchSupabaseAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${CONFIG.apiBaseUrl}${endpoint}`;
    logVerbose(`Fetching: ${url}`);

    const options = {
      headers: {
        'Authorization': `Bearer ${CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function executeSQL(query) {
  return new Promise((resolve, reject) => {
    const url = `${CONFIG.apiBaseUrl}/projects/${CONFIG.projectId}/database/query`;
    logVerbose(`Executing SQL query...`);

    const postData = JSON.stringify({ query });

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      ...options,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ============================================================================
// Recuperation des donnees Supabase
// ============================================================================

async function fetchTables() {
  try {
    const response = await fetchSupabaseAPI(`/projects/${CONFIG.projectId}/database/tables?schemas=public`);
    return response || [];
  } catch (error) {
    log(`Erreur lors de la recuperation des tables: ${error.message}`, 'red');
    return [];
  }
}

async function fetchFunctions() {
  const query = `
    SELECT
      p.proname as function_name,
      pg_catalog.pg_get_function_arguments(p.oid) as arguments,
      pg_catalog.pg_get_function_result(p.oid) as return_type,
      CASE p.provolatile
        WHEN 'i' THEN 'IMMUTABLE'
        WHEN 's' THEN 'STABLE'
        WHEN 'v' THEN 'VOLATILE'
      END as volatility,
      p.prosecdef as security_definer,
      obj_description(p.oid, 'pg_proc') as description
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
    ORDER BY p.proname;
  `;

  try {
    const response = await executeSQL(query);
    return response || [];
  } catch (error) {
    log(`Erreur lors de la recuperation des fonctions: ${error.message}`, 'red');
    return [];
  }
}

async function fetchTriggers() {
  const query = `
    SELECT
      tg.tgname as trigger_name,
      c.relname as table_name,
      pg_get_triggerdef(tg.oid) as trigger_definition,
      p.proname as function_name
    FROM pg_trigger tg
    JOIN pg_class c ON c.oid = tg.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = tg.tgfoid
    WHERE n.nspname = 'public'
    AND NOT tg.tgisinternal
    ORDER BY c.relname, tg.tgname;
  `;

  try {
    const response = await executeSQL(query);
    return response || [];
  } catch (error) {
    log(`Erreur lors de la recuperation des triggers: ${error.message}`, 'red');
    return [];
  }
}

async function fetchMaterializedViews() {
  const query = `
    SELECT
      c.relname as view_name,
      pg_get_viewdef(c.oid, true) as view_definition,
      obj_description(c.oid, 'pg_class') as description
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'm'
    AND n.nspname = 'public'
    ORDER BY c.relname;
  `;

  try {
    const response = await executeSQL(query);
    return response || [];
  } catch (error) {
    log(`Erreur lors de la recuperation des vues materialisees: ${error.message}`, 'red');
    return [];
  }
}

async function fetchViews() {
  const query = `
    SELECT
      c.relname as view_name,
      pg_get_viewdef(c.oid, true) as view_definition,
      obj_description(c.oid, 'pg_class') as description
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'v'
    AND n.nspname = 'public'
    ORDER BY c.relname;
  `;

  try {
    const response = await executeSQL(query);
    return response || [];
  } catch (error) {
    log(`Erreur lors de la recuperation des vues: ${error.message}`, 'red');
    return [];
  }
}

async function fetchEnums() {
  const query = `
    SELECT
      t.typname as type_name,
      ARRAY(SELECT e.enumlabel FROM pg_enum e WHERE e.enumtypid = t.oid ORDER BY e.enumsortorder) as enum_values
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typtype = 'e'
    AND n.nspname = 'public'
    ORDER BY t.typname;
  `;

  try {
    const response = await executeSQL(query);
    return response || [];
  } catch (error) {
    log(`Erreur lors de la recuperation des enums: ${error.message}`, 'red');
    return [];
  }
}

async function fetchCronJobs() {
  const query = `
    SELECT
      jobid,
      schedule,
      command,
      database,
      username,
      active
    FROM cron.job
    ORDER BY jobid;
  `;

  try {
    const response = await executeSQL(query);
    return response || [];
  } catch (error) {
    log(`Erreur lors de la recuperation des jobs pg_cron: ${error.message}`, 'red');
    return [];
  }
}

async function fetchEdgeFunctions() {
  try {
    const response = await fetchSupabaseAPI(`/projects/${CONFIG.projectId}/functions`);
    return response || [];
  } catch (error) {
    log(`Erreur lors de la recuperation des edge functions: ${error.message}`, 'red');
    return [];
  }
}

async function fetchExtensions() {
  try {
    const response = await fetchSupabaseAPI(`/projects/${CONFIG.projectId}/database/extensions`);
    // Filtrer uniquement les extensions installees
    return (response || []).filter(ext => ext.installed_version !== null);
  } catch (error) {
    log(`Erreur lors de la recuperation des extensions: ${error.message}`, 'red');
    return [];
  }
}

// ============================================================================
// Generation de la documentation
// ============================================================================

function generateConfigurationMd(data) {
  const { tables, functions, triggers, materializedViews, views, enums, cronJobs, edgeFunctions, extensions } = data;

  const today = new Date().toISOString().split('T')[0];

  let md = `# Documentation Supabase - Royaume des Paraiges

## Informations Projet

| Propriete | Valeur |
|-----------|--------|
| **Project ID** | \`${CONFIG.projectId}\` |
| **Region** | us-east-2 |
| **URL API** | \`https://${CONFIG.projectId}.supabase.co\` |

## Vue d'ensemble

Cette documentation decrit la configuration complete de la base de donnees Supabase pour l'application Royaume des Paraiges.

## Structure de la Documentation

\`\`\`
supabase/docs/
├── SUPABASE-CONFIG.md           # Ce fichier
├── tables/                      # Structure des tables
│   ├── README.md               # Vue d'ensemble des tables
${tables.map(t => `│   ├── ${t.name}.md`).join('\n')}
├── functions/                   # Fonctions PostgreSQL
│   ├── README.md               # Index des fonctions
│   └── ...
├── triggers/                    # Triggers
│   └── README.md
├── policies/                    # Politiques RLS
│   └── README.md
├── views/                       # Vues et vues materialisees
│   └── README.md
├── storage/                     # Buckets et policies storage
│   └── README.md
└── edge-functions/             # Edge Functions
    └── README.md
\`\`\`

## Resume de la Base de Donnees

### Tables (${tables.length})

| Table | Lignes | RLS | Description |
|-------|--------|-----|-------------|
${tables.map(t => `| \`${t.name}\` | ${t.rows || 0} | ${t.rls_enabled ? 'Oui' : 'Non'} | ${t.comment || '-'} |`).join('\n')}

### Types Personnalises (Enums)

| Enum | Valeurs |
|------|---------|
${enums.map(e => `| \`${e.type_name}\` | ${Array.isArray(e.enum_values) ? e.enum_values.map(v => `\`${v}\``).join(', ') : e.enum_values} |`).join('\n')}

### Fonctions (${functions.length})

Fonctions principales :
${functions.slice(0, 10).map(f => `- \`${f.function_name}\` - ${f.description || 'Pas de description'}`).join('\n')}
${functions.length > 10 ? `\n... et ${functions.length - 10} autres fonctions` : ''}

### Triggers (${triggers.length})

| Trigger | Table | Description |
|---------|-------|-------------|
${triggers.map(t => `| \`${t.trigger_name}\` | \`${t.table_name}\` | Appelle \`${t.function_name}\` |`).join('\n')}

### Jobs pg_cron (${cronJobs.length})

| Job | Cron | Description |
|-----|------|-------------|
${cronJobs.map(j => `| Job ${j.jobid} | \`${j.schedule}\` | \`${j.command}\` |`).join('\n')}

### Vues Materialisees (${materializedViews.length})

${materializedViews.map(v => `- \`${v.view_name}\` - ${v.description || 'Pas de description'}`).join('\n')}

### Vues (${views.length})

${views.map(v => `- \`${v.view_name}\` - ${v.description || 'Pas de description'}`).join('\n')}

### Storage Buckets (1)

- \`avatars\` - Photos de profil (public)

### Edge Functions (${edgeFunctions.length})

${edgeFunctions.map(f => `- \`${f.slug}\` - ${f.name} (JWT: ${f.verify_jwt ? 'Oui' : 'Non'})`).join('\n')}

## Extensions Installees

| Extension | Schema | Version | Description |
|-----------|--------|---------|-------------|
${extensions.map(e => `| \`${e.name}\` | ${e.schema || '-'} | ${e.installed_version} | ${e.comment || '-'} |`).join('\n')}

## Schema Relationnel

\`\`\`
auth.users
    │
    └──► profiles (id = auth.uid())
            │
            ├──► likes (user_id)
            ├──► comments (customer_id)
            ├──► notes (customer_id)
            ├──► coupons (customer_id)
            ├──► user_badges (customer_id)
            ├──► leaderboard_reward_distributions (customer_id)
            ├──► spendings (customer_id)
            ├──► coupon_distribution_logs (customer_id, distributed_by)
            ├──► coupon_templates (created_by)
            ├──► period_reward_configs (distributed_by)
            │
            └──► receipts (customer_id)
                    │
                    ├──► receipt_lines (receipt_id)
                    ├──► gains (receipt_id)
                    └──► spendings (receipt_id)

badge_types ──► user_badges (badge_id)
            └──► reward_tiers (badge_type_id)

coupons ◄── leaderboard_reward_distributions (coupon_amount_id, coupon_percentage_id)
        ◄── coupon_distribution_logs (coupon_id)

coupon_templates ──► coupons (template_id)
                 └──► reward_tiers (coupon_template_id)
                 └──► coupon_distribution_logs (coupon_template_id)

reward_tiers ──► coupon_distribution_logs (tier_id)
\`\`\`

## Derniere mise a jour

- **Date** : ${today}
- **Generee automatiquement** par \`scripts/sync-supabase-docs.mjs\`
`;

  return md;
}

function generateTableMd(table) {
  const columns = table.columns || [];
  const foreignKeys = table.foreign_key_constraints || [];

  let md = `# Table: ${table.name}

${table.comment || 'Pas de description disponible.'}

## Informations

| Propriete | Valeur |
|-----------|--------|
| **Schema** | \`${table.schema}\` |
| **RLS** | ${table.rls_enabled ? 'Active' : 'Desactive'} |
| **Lignes** | ${table.rows || 0} |

## Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
${columns.map(c => {
  const nullable = c.options?.includes('nullable') ? 'Oui' : 'Non';
  const defaultVal = c.default_value || '-';
  return `| \`${c.name}\` | \`${c.data_type}\` | ${nullable} | ${defaultVal} | ${c.comment || '-'} |`;
}).join('\n')}

## Cles primaires

${table.primary_keys?.map(pk => `- \`${pk}\``).join('\n') || 'Aucune'}

## Relations (Foreign Keys)

${foreignKeys.length > 0
  ? foreignKeys.map(fk => `- \`${fk.name}\`: ${fk.source} → ${fk.target}`).join('\n')
  : 'Aucune relation definie.'}
`;

  return md;
}

function generateFunctionsReadmeMd(functions) {
  let md = `# Fonctions PostgreSQL

Cette section documente toutes les fonctions PostgreSQL disponibles dans le schema \`public\`.

## Liste des fonctions (${functions.length})

| Fonction | Arguments | Retour | Volatilite | Security Definer |
|----------|-----------|--------|------------|------------------|
${functions.map(f =>
  `| \`${f.function_name}\` | ${f.arguments || '-'} | \`${f.return_type}\` | ${f.volatility} | ${f.security_definer ? 'Oui' : 'Non'} |`
).join('\n')}

## Descriptions

${functions.filter(f => f.description).map(f => `
### ${f.function_name}

${f.description}

- **Arguments**: \`${f.arguments || 'aucun'}\`
- **Retour**: \`${f.return_type}\`
`).join('\n')}
`;

  return md;
}

function generateViewsReadmeMd(materializedViews, views) {
  let md = `# Vues et Vues Materialisees

## Vues Materialisees (${materializedViews.length})

Les vues materialisees stockent les resultats et doivent etre rafraichies periodiquement.

${materializedViews.map(v => `
### ${v.view_name}

${v.description || 'Pas de description.'}

\`\`\`sql
${v.view_definition}
\`\`\`
`).join('\n')}

## Vues (${views.length})

${views.map(v => `
### ${v.view_name}

${v.description || 'Pas de description.'}

\`\`\`sql
${v.view_definition}
\`\`\`
`).join('\n')}
`;

  return md;
}

function generateTriggersReadmeMd(triggers) {
  let md = `# Triggers

## Liste des triggers (${triggers.length})

| Trigger | Table | Fonction |
|---------|-------|----------|
${triggers.map(t => `| \`${t.trigger_name}\` | \`${t.table_name}\` | \`${t.function_name}\` |`).join('\n')}

## Details

${triggers.map(t => `
### ${t.trigger_name}

- **Table**: \`${t.table_name}\`
- **Fonction**: \`${t.function_name}\`

\`\`\`sql
${t.trigger_definition}
\`\`\`
`).join('\n')}
`;

  return md;
}

function generateEdgeFunctionsReadmeMd(edgeFunctions) {
  let md = `# Edge Functions

## Liste des Edge Functions (${edgeFunctions.length})

| Slug | Nom | JWT Required | Status |
|------|-----|--------------|--------|
${edgeFunctions.map(f => `| \`${f.slug}\` | ${f.name} | ${f.verify_jwt ? 'Oui' : 'Non'} | ${f.status} |`).join('\n')}

## Details

${edgeFunctions.map(f => `
### ${f.slug}

- **ID**: \`${f.id}\`
- **Version**: ${f.version}
- **JWT Required**: ${f.verify_jwt ? 'Oui' : 'Non'}
- **Status**: ${f.status}
- **Entrypoint**: \`${f.entrypoint_path}\`
- **Cree le**: ${new Date(f.created_at).toISOString()}
`).join('\n')}
`;

  return md;
}

// ============================================================================
// Comparaison et mise a jour
// ============================================================================

function readExistingFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function normalizeContent(content) {
  // Normalise le contenu pour la comparaison (ignore les espaces et dates)
  return content
    .replace(/\*\*Date\*\* : \d{4}-\d{2}-\d{2}/g, '**Date** : XXXX-XX-XX')
    .replace(/\| \d+ \|/g, '| X |') // Ignore row counts
    .replace(/\s+/g, ' ')
    .trim();
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

function compareAndUpdate(filePath, newContent, label) {
  const existingContent = readExistingFile(filePath);

  if (existingContent === null) {
    log(`[NEW] ${label}`, 'green');
    if (!DRY_RUN) {
      writeFile(filePath, newContent);
      log(`  → Fichier cree: ${filePath}`, 'cyan');
    }
    return { status: 'created', file: filePath };
  }

  const normalizedExisting = normalizeContent(existingContent);
  const normalizedNew = normalizeContent(newContent);

  if (normalizedExisting !== normalizedNew) {
    log(`[UPDATE] ${label}`, 'yellow');
    if (!DRY_RUN) {
      writeFile(filePath, newContent);
      log(`  → Fichier mis a jour: ${filePath}`, 'cyan');
    }
    return { status: 'updated', file: filePath };
  }

  logVerbose(`[OK] ${label} - Aucun changement`);
  return { status: 'unchanged', file: filePath };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  log('\n========================================', 'blue');
  log('  Synchronisation Documentation Supabase', 'blue');
  log('========================================\n', 'blue');

  if (DRY_RUN) {
    log('[DRY RUN] Aucun fichier ne sera modifie\n', 'yellow');
  }

  let data;

  // Mode: Charger depuis un fichier snapshot
  if (FROM_SNAPSHOT) {
    log(`Chargement des donnees depuis: ${FROM_SNAPSHOT}`, 'cyan');
    try {
      const snapshotPath = path.resolve(process.cwd(), FROM_SNAPSHOT);
      const snapshotContent = fs.readFileSync(snapshotPath, 'utf-8');
      data = JSON.parse(snapshotContent);
      log('Snapshot charge avec succes\n', 'green');
    } catch (error) {
      log(`Erreur lors du chargement du snapshot: ${error.message}`, 'red');
      process.exit(1);
    }
  }
  // Mode: Recuperer depuis l'API Supabase
  else {
    if (!CONFIG.accessToken) {
      log('Erreur: SUPABASE_ACCESS_TOKEN non defini', 'red');
      log('', 'reset');
      log('Options disponibles:', 'cyan');
      log('  1. Definir SUPABASE_ACCESS_TOKEN (generer sur https://app.supabase.com/account/tokens)', 'reset');
      log('  2. Utiliser un fichier snapshot: --from-snapshot snapshot.json', 'reset');
      log('', 'reset');
      process.exit(1);
    }

    log('Recuperation des donnees depuis Supabase...', 'cyan');

    // Recuperation des donnees
    const [tables, functions, triggers, materializedViews, views, enums, cronJobs, edgeFunctions, extensions] = await Promise.all([
      fetchTables(),
      fetchFunctions(),
      fetchTriggers(),
      fetchMaterializedViews(),
      fetchViews(),
      fetchEnums(),
      fetchCronJobs(),
      fetchEdgeFunctions(),
      fetchExtensions(),
    ]);

    data = { tables, functions, triggers, materializedViews, views, enums, cronJobs, edgeFunctions, extensions };

    // Sauvegarder le snapshot si demande
    if (SAVE_SNAPSHOT) {
      const snapshotPath = path.resolve(process.cwd(), SAVE_SNAPSHOT);
      fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2), 'utf-8');
      log(`\nSnapshot sauvegarde: ${snapshotPath}`, 'green');
    }
  }

  const { tables, functions, triggers, materializedViews, views, enums, cronJobs, edgeFunctions, extensions } = data;

  log(`\nDonnees recuperees:`, 'green');
  log(`  - ${tables.length} tables`);
  log(`  - ${functions.length} fonctions`);
  log(`  - ${triggers.length} triggers`);
  log(`  - ${materializedViews.length} vues materialisees`);
  log(`  - ${views.length} vues`);
  log(`  - ${enums.length} enums`);
  log(`  - ${cronJobs.length} jobs pg_cron`);
  log(`  - ${edgeFunctions.length} edge functions`);
  log(`  - ${extensions.length} extensions installees`);

  log('\nComparaison et mise a jour de la documentation...\n', 'cyan');

  const results = [];

  // Configuration principale
  results.push(compareAndUpdate(
    path.join(CONFIG.docsPath, 'configuration.md'),
    generateConfigurationMd(data),
    'configuration.md'
  ));

  // Tables individuelles
  for (const table of tables) {
    results.push(compareAndUpdate(
      path.join(CONFIG.docsPath, 'tables', `${table.name}.md`),
      generateTableMd(table),
      `tables/${table.name}.md`
    ));
  }

  // Fonctions README
  results.push(compareAndUpdate(
    path.join(CONFIG.docsPath, 'functions', 'README.md'),
    generateFunctionsReadmeMd(functions),
    'functions/README.md'
  ));

  // Vues README
  results.push(compareAndUpdate(
    path.join(CONFIG.docsPath, 'views', 'README.md'),
    generateViewsReadmeMd(materializedViews, views),
    'views/README.md'
  ));

  // Triggers README
  results.push(compareAndUpdate(
    path.join(CONFIG.docsPath, 'triggers', 'README.md'),
    generateTriggersReadmeMd(triggers),
    'triggers/README.md'
  ));

  // Edge Functions README
  results.push(compareAndUpdate(
    path.join(CONFIG.docsPath, 'edge-functions', 'README.md'),
    generateEdgeFunctionsReadmeMd(edgeFunctions),
    'edge-functions/README.md'
  ));

  // Resume
  log('\n========================================', 'blue');
  log('  Resume', 'blue');
  log('========================================\n', 'blue');

  const created = results.filter(r => r.status === 'created').length;
  const updated = results.filter(r => r.status === 'updated').length;
  const unchanged = results.filter(r => r.status === 'unchanged').length;

  log(`  Fichiers crees:      ${created}`, created > 0 ? 'green' : 'reset');
  log(`  Fichiers mis a jour: ${updated}`, updated > 0 ? 'yellow' : 'reset');
  log(`  Fichiers inchanges:  ${unchanged}`);

  if (DRY_RUN && (created > 0 || updated > 0)) {
    log('\n[DRY RUN] Pour appliquer les changements, relancez sans --dry-run', 'yellow');
  }

  log('\nTermine!\n', 'green');
}

main().catch((error) => {
  log(`\nErreur fatale: ${error.message}`, 'red');
  if (VERBOSE) {
    console.error(error);
  }
  process.exit(1);
});
