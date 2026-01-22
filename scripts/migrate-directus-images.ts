/**
 * Script de migration des images Directus vers Supabase Storage
 *
 * Ce script:
 * 1. Recupere tous les enregistrements avec images depuis Supabase
 * 2. Telecharge chaque image depuis Directus
 * 3. Upload vers Supabase Storage (bucket: content-assets)
 * 4. Met a jour le chemin de l'image dans la base de donnees
 *
 * Usage:
 *   npx ts-node migrate-directus-images.ts
 *
 * Variables d'environnement requises:
 *   SUPABASE_URL - URL du projet Supabase
 *   SUPABASE_SERVICE_ROLE_KEY - Cle service role (pas anon key!)
 *   DIRECTUS_URL - URL du serveur Directus
 *
 * Prerequis:
 *   - Bucket "content-assets" cree dans Supabase Storage
 *   - Politique de lecture publique sur le bucket
 */

import { createClient } from "@supabase/supabase-js";

// Configuration
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://uflgfsoekkgegdgecubb.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DIRECTUS_URL =
  process.env.DIRECTUS_URL || "https://paraiges-directus.neodelta.dev";
const BUCKET_NAME = "content-assets";

// Mode dry-run (ne fait pas les modifications reelles)
const DRY_RUN = process.argv.includes("--dry-run");

// Types
interface MigrationResult {
  success: boolean;
  table: string;
  id: number;
  field: string;
  oldPath: string;
  newPath?: string;
  error?: string;
}

// Statistiques
const stats = {
  total: 0,
  success: 0,
  skipped: 0,
  failed: 0,
  errors: [] as string[],
};

// Client Supabase avec cle service role pour bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Telecharge une image depuis Directus
 */
async function downloadFromDirectus(imageUuid: string): Promise<Buffer | null> {
  const url = `${DIRECTUS_URL}/assets/${imageUuid}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`  Erreur HTTP ${response.status} pour ${imageUuid}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`  Erreur telechargement ${imageUuid}:`, error);
    return null;
  }
}

/**
 * Detecte le type MIME d'une image
 */
function detectMimeType(buffer: Buffer): string {
  // Verifier les magic bytes
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return "image/gif";
  }
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  ) {
    return "image/webp";
  }

  // Par defaut
  return "image/jpeg";
}

/**
 * Determine l'extension de fichier a partir du type MIME
 */
function getExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  return extensions[mimeType] || "jpg";
}

/**
 * Upload une image vers Supabase Storage
 */
async function uploadToSupabase(
  buffer: Buffer,
  path: string
): Promise<string | null> {
  const mimeType = detectMimeType(buffer);

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error(`  Erreur upload ${path}:`, error.message);
      return null;
    }

    return data.path;
  } catch (error) {
    console.error(`  Erreur upload ${path}:`, error);
    return null;
  }
}

/**
 * Migre une image individuelle
 */
async function migrateImage(
  table: string,
  id: number,
  field: string,
  imageUuid: string,
  targetPath: string
): Promise<MigrationResult> {
  stats.total++;

  const result: MigrationResult = {
    success: false,
    table,
    id,
    field,
    oldPath: imageUuid,
  };

  console.log(`  [${table}/${id}] ${field}: ${imageUuid}`);

  if (DRY_RUN) {
    console.log(`    -> (dry-run) Serait migre vers: ${targetPath}`);
    result.success = true;
    result.newPath = targetPath;
    stats.success++;
    return result;
  }

  // 1. Telecharger depuis Directus
  const buffer = await downloadFromDirectus(imageUuid);
  if (!buffer) {
    result.error = "Echec telechargement";
    stats.failed++;
    stats.errors.push(`${table}/${id}/${field}: Echec telechargement`);
    return result;
  }

  // 2. Determiner l'extension
  const mimeType = detectMimeType(buffer);
  const extension = getExtension(mimeType);
  const finalPath = `${targetPath}.${extension}`;

  // 3. Upload vers Supabase Storage
  const uploadedPath = await uploadToSupabase(buffer, finalPath);
  if (!uploadedPath) {
    result.error = "Echec upload";
    stats.failed++;
    stats.errors.push(`${table}/${id}/${field}: Echec upload`);
    return result;
  }

  // 4. Mettre a jour la base de donnees
  const { error: updateError } = await supabase
    .from(table)
    .update({ [field]: finalPath })
    .eq("id", id);

  if (updateError) {
    result.error = `Echec update: ${updateError.message}`;
    stats.failed++;
    stats.errors.push(`${table}/${id}/${field}: ${updateError.message}`);
    return result;
  }

  console.log(`    -> Migre vers: ${finalPath}`);
  result.success = true;
  result.newPath = finalPath;
  stats.success++;

  return result;
}

/**
 * Migre les images des bieres
 */
async function migrateBeers(): Promise<void> {
  console.log("\n=== Migration des images de bieres ===\n");

  const { data: beers, error } = await supabase
    .from("beers")
    .select("id, featured_image")
    .not("featured_image", "is", null)
    .order("id");

  if (error) {
    console.error("Erreur recuperation bieres:", error);
    return;
  }

  console.log(`Trouvees: ${beers?.length || 0} bieres avec image\n`);

  for (const beer of beers || []) {
    if (beer.featured_image && !beer.featured_image.startsWith("beers/")) {
      await migrateImage(
        "beers",
        beer.id,
        "featured_image",
        beer.featured_image,
        `beers/${beer.id}`
      );
    } else {
      console.log(`  [beers/${beer.id}] Deja migre ou invalide, ignore`);
      stats.skipped++;
    }
  }
}

/**
 * Migre les images des etablissements
 */
async function migrateEstablishments(): Promise<void> {
  console.log("\n=== Migration des images d'etablissements ===\n");

  const { data: establishments, error } = await supabase
    .from("establishments")
    .select("id, featured_image, logo")
    .order("id");

  if (error) {
    console.error("Erreur recuperation etablissements:", error);
    return;
  }

  console.log(
    `Trouves: ${establishments?.length || 0} etablissements\n`
  );

  for (const est of establishments || []) {
    // Featured image
    if (
      est.featured_image &&
      !est.featured_image.startsWith("establishments/")
    ) {
      await migrateImage(
        "establishments",
        est.id,
        "featured_image",
        est.featured_image,
        `establishments/${est.id}`
      );
    } else if (est.featured_image) {
      console.log(
        `  [establishments/${est.id}] featured_image: Deja migre, ignore`
      );
      stats.skipped++;
    }

    // Logo
    if (est.logo && !est.logo.startsWith("establishments/")) {
      await migrateImage(
        "establishments",
        est.id,
        "logo",
        est.logo,
        `establishments/${est.id}_logo`
      );
    } else if (est.logo) {
      console.log(`  [establishments/${est.id}] logo: Deja migre, ignore`);
      stats.skipped++;
    }
  }
}

/**
 * Migre les images des news
 */
async function migrateNews(): Promise<void> {
  console.log("\n=== Migration des images de news ===\n");

  const { data: news, error } = await supabase
    .from("news")
    .select("id, featured_image")
    .not("featured_image", "is", null)
    .order("id");

  if (error) {
    console.error("Erreur recuperation news:", error);
    return;
  }

  console.log(`Trouvees: ${news?.length || 0} news avec image\n`);

  for (const item of news || []) {
    if (item.featured_image && !item.featured_image.startsWith("news/")) {
      await migrateImage(
        "news",
        item.id,
        "featured_image",
        item.featured_image,
        `news/${item.id}`
      );
    } else {
      console.log(`  [news/${item.id}] Deja migre ou invalide, ignore`);
      stats.skipped++;
    }
  }
}

/**
 * Verifie les prerequis
 */
async function checkPrerequisites(): Promise<boolean> {
  console.log("=== Verification des prerequis ===\n");

  // Verifier la cle service role
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "ERREUR: Variable SUPABASE_SERVICE_ROLE_KEY non definie"
    );
    console.error(
      "Cette cle est necessaire pour bypass RLS et acceder au Storage"
    );
    return false;
  }

  // Verifier le bucket
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error("Erreur listage buckets:", bucketsError);
    return false;
  }

  const bucket = buckets?.find((b) => b.name === BUCKET_NAME);
  if (!bucket) {
    console.error(`ERREUR: Bucket "${BUCKET_NAME}" n'existe pas`);
    console.error("Creez-le via le dashboard Supabase Storage");
    return false;
  }

  console.log(`Bucket "${BUCKET_NAME}" trouve`);

  // Verifier la connexion a Directus
  try {
    const response = await fetch(`${DIRECTUS_URL}/server/health`);
    if (!response.ok) {
      console.warn(
        `ATTENTION: Directus semble inaccessible (status ${response.status})`
      );
    } else {
      console.log(`Directus accessible: ${DIRECTUS_URL}`);
    }
  } catch (error) {
    console.warn(`ATTENTION: Impossible de verifier Directus: ${error}`);
  }

  console.log("\nPrerequisites OK\n");
  return true;
}

/**
 * Point d'entree principal
 */
async function main(): Promise<void> {
  console.log("========================================");
  console.log("  Migration Images Directus -> Supabase");
  console.log("========================================\n");

  if (DRY_RUN) {
    console.log("MODE DRY-RUN: Aucune modification ne sera effectuee\n");
  }

  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`Directus: ${DIRECTUS_URL}`);
  console.log(`Bucket: ${BUCKET_NAME}\n`);

  // Verifier les prerequis
  const prereqsOk = await checkPrerequisites();
  if (!prereqsOk) {
    console.error("\nAbandon: Prerequis non remplis");
    process.exit(1);
  }

  // Migrer les images
  await migrateBeers();
  await migrateEstablishments();
  await migrateNews();

  // Afficher le resume
  console.log("\n========================================");
  console.log("  Resume de la migration");
  console.log("========================================\n");
  console.log(`Total traite: ${stats.total}`);
  console.log(`Succes: ${stats.success}`);
  console.log(`Ignores (deja migres): ${stats.skipped}`);
  console.log(`Echecs: ${stats.failed}`);

  if (stats.errors.length > 0) {
    console.log("\nErreurs rencontrees:");
    stats.errors.forEach((e) => console.log(`  - ${e}`));
  }

  if (DRY_RUN) {
    console.log(
      "\nMODE DRY-RUN: Executez sans --dry-run pour appliquer les modifications"
    );
  } else if (stats.success > 0) {
    console.log(
      "\nN'oubliez pas d'activer USE_SUPABASE_STORAGE dans directusService.ts"
    );
  }
}

// Executer
main().catch(console.error);
