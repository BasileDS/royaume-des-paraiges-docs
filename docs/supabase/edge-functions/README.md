# Edge Functions - Royaume des Paraiges

## Vue d'ensemble

Le projet utilise **1 Edge Function** déployée sur Supabase.

## Liste des Edge Functions

| Fonction | Status | JWT | Description |
|----------|--------|-----|-------------|
| `send-contact-email` | ACTIVE | ✅ | Envoi d'emails de contact via Brevo |

---

## send-contact-email

**But** : Recevoir les formulaires de contact du site web et envoyer un email de notification via Brevo (ex-Sendinblue).

### Métadonnées

| Propriété | Valeur |
|-----------|--------|
| **ID** | `c138bc5c-d111-4b7a-9e33-e74f654535d4` |
| **Slug** | `send-contact-email` |
| **Version** | 1 |
| **Status** | ACTIVE |
| **Verify JWT** | true |
| **Entrypoint** | `send-contact-email/index.ts` |

### URL d'Appel

```
POST https://uflgfsoekkgegdgecubb.supabase.co/functions/v1/send-contact-email
```

### Headers Requis

```
Authorization: Bearer <SUPABASE_ANON_KEY>
Content-Type: application/json
```

### Corps de la Requête

```typescript
interface ContactFormData {
  firstName: string;    // Requis
  lastName: string;     // Requis
  company: string;      // Requis
  email: string;        // Requis
  phone?: string;       // Optionnel
  message?: string;     // Optionnel
  consent: boolean;     // Requis (RGPD)
}
```

### Exemple de Requête

```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "company": "Acme Corp",
  "email": "jean.dupont@acme.com",
  "phone": "+33612345678",
  "message": "Je souhaite plus d'informations sur vos services.",
  "consent": true
}
```

### Réponses

#### Succès (200)

```json
{
  "success": true,
  "message": "Message sent successfully",
  "id": 123,
  "messageId": "brevo-message-id"
}
```

#### Erreur de Validation (400)

```json
{
  "error": "Missing required fields"
}
```

#### Erreur Serveur (500)

```json
{
  "error": "An error occurred while processing your request"
}
```

### Flux d'Exécution

```
1. Réception de la requête
         │
         ▼
2. Validation des champs requis
         │
         ▼
3. Sauvegarde en base (table contact_messages)
         │
         ▼
4. Vérification clé API Brevo
   └── Si absente → retourne succès sans email
         │
         ▼
5. Construction de l'email HTML/Text
         │
         ▼
6. Envoi via API Brevo
         │
         ▼
7. Retour du résultat
```

### Variables d'Environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `SUPABASE_URL` | URL du projet Supabase | ✅ (auto) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role | ✅ (auto) |
| `BREVO_API_KEY` | Clé API Brevo | ⚠️ (optionnel) |
| `RECIPIENT_EMAIL` | Email destinataire | ❌ (défaut: info@regplus.lu) |

### Code Source

#### index.ts

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone?: string;
  message?: string;
  consent: boolean;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const formData: ContactFormData = await req.json();

    // Validation
    if (!formData.firstName || !formData.lastName ||
        !formData.company || !formData.email || !formData.consent) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: dbData, error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        company: formData.company,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message || null,
        consent: formData.consent,
      })
      .select()
      .single();

    if (dbError) throw new Error('Failed to save message');

    // Send email via Brevo
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (!brevoApiKey) {
      return new Response(
        JSON.stringify({ success: true, message: 'Message saved', id: dbData.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ... envoi email Brevo ...

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent', id: dbData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

#### deno.json

```json
{
  "imports": {
    "@supabase/supabase-js": "jsr:@supabase/supabase-js@^2.47.10"
  }
}
```

---

## Utilisation depuis l'Application

```typescript
import { supabase } from '@/src/core/api/supabase';

async function sendContactForm(data: ContactFormData) {
  const { data: response, error } = await supabase.functions.invoke(
    'send-contact-email',
    {
      body: data
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return response;
}

// Exemple d'utilisation
try {
  const result = await sendContactForm({
    firstName: 'Jean',
    lastName: 'Dupont',
    company: 'Acme',
    email: 'jean@acme.com',
    consent: true
  });
  console.log('Message envoyé:', result.id);
} catch (error) {
  console.error('Erreur:', error.message);
}
```

---

## Déploiement

### Via MCP (depuis ce projet)

```typescript
// Utiliser la fonction mcp deploy_edge_function
await deploy_edge_function({
  project_id: 'uflgfsoekkgegdgecubb',
  name: 'send-contact-email',
  files: [
    { name: 'index.ts', content: '...' },
    { name: 'deno.json', content: '...' }
  ]
});
```

### Via CLI Supabase

```bash
# Depuis le dossier du projet
supabase functions deploy send-contact-email --project-ref uflgfsoekkgegdgecubb
```

---

## Configuration des Secrets

```bash
# Ajouter la clé API Brevo
supabase secrets set BREVO_API_KEY=your-api-key --project-ref uflgfsoekkgegdgecubb

# Changer l'email destinataire
supabase secrets set RECIPIENT_EMAIL=contact@monsite.com --project-ref uflgfsoekkgegdgecubb
```

---

## Logs et Debugging

```typescript
// Récupérer les logs via MCP
const logs = await get_logs({
  project_id: 'uflgfsoekkgegdgecubb',
  service: 'edge-function'
});
```

---

## Notes

- La fonction nécessite un JWT valide (anon key ou user token)
- Les messages sont toujours sauvegardés en base, même si l'envoi d'email échoue
- CORS est configuré pour accepter toutes les origines (`*`)
- La table `contact_messages` doit exister (non documentée dans les tables principales)
