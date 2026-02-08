# Royaume Paraiges Scanner - Specifications Fonctionnelles

> **Application** : PWA pour serveurs en etablissements (bars/restaurants)
> **Version** : 1.0.0
> **Date** : 2026-02-04

---

## Table des matieres

1. [Vue d'ensemble](#vue-densemble)
2. [Utilisateurs cibles](#utilisateurs-cibles)
3. [Architecture technique](#architecture-technique)
4. [Fonctionnalites](#fonctionnalites)
5. [Flux utilisateur](#flux-utilisateur)
6. [Modele de donnees](#modele-de-donnees)
7. [Integration Supabase](#integration-supabase)
8. [Interface utilisateur](#interface-utilisateur)
9. [Securite](#securite)
10. [Contraintes techniques](#contraintes-techniques)

---

## Vue d'ensemble

### Objectif

Royaume Paraiges Scanner est une Progressive Web App (PWA) destinee aux serveurs des etablissements partenaires du Royaume des Paraiges. Elle permet de :

1. **Scanner les QR codes** des clients pour les identifier
2. **Consulter les informations** du client (solde, coupons, XP)
3. **Enregistrer les paiements** dans la base de donnees Supabase
4. **Consulter l'historique** des transactions effectuees

### Contexte

L'application s'integre dans l'ecosysteme Royaume des Paraiges :

- **royaume-paraiges-front** : App client mobile (affiche QR code, consulte solde, gagne XP/cashback)
- **royaume-paraiges-scanner** : PWA serveur (scanne QR code, enregistre paiements)
- **Supabase** : Backend commun (profiles, receipts, gains, coupons, user_stats)

---

## Utilisateurs cibles

### Roles autorises

Les utilisateurs de l'application doivent avoir l'un des roles suivants dans `profiles.role` :

| Role | Description |
|------|-------------|
| `employee` | Serveur/employe d'un etablissement |
| `admin` | Administrateur du systeme |
| `establishment` | Compte etablissement |

### Contraintes d'acces

- **Authentification obligatoire** via Supabase Auth
- **Liaison etablissement** : L'utilisateur doit avoir un `attached_establishment_id` valide
- **Restriction** : Les receipts ne peuvent etre crees que pour l'etablissement de reference du serveur

### Verification a l'authentification

```typescript
// Pseudo-code de verification
const user = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('profiles')
  .select('role, attached_establishment_id')
  .eq('id', user.id)
  .single();

const isAuthorized =
  ['employee', 'admin', 'establishment'].includes(profile.role) &&
  profile.attached_establishment_id !== null;
```

---

## Architecture technique

### Stack technologique

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| Next.js | 14.2 | Framework React avec App Router |
| TypeScript | 5.7 | Langage principal |
| Tailwind CSS | 3.4 | Styles |
| Supabase | 2.75.0 | Backend (auth, database) |
| html5-qrcode | 2.3 | Scanner QR code camera |
| Zustand | 5.0 | State management |
| next-pwa | 5.6 | Configuration PWA |

### Structure du projet

```
royaume-paraiges-scanner/
├── src/
│   ├── app/                      # Pages Next.js App Router
│   │   ├── layout.tsx            # Layout principal
│   │   ├── page.tsx              # Page d'accueil (scanner)
│   │   ├── login/                # Authentification
│   │   ├── payment/              # Formulaire de paiement
│   │   └── history/              # Historique des transactions
│   │
│   ├── components/               # Composants React
│   │   ├── scanner/              # Scanner QR code
│   │   ├── payment/              # Formulaire paiement
│   │   ├── client/               # Affichage infos client
│   │   ├── history/              # Liste des transactions
│   │   └── ui/                   # Composants generiques
│   │
│   ├── hooks/                    # Hooks personnalises
│   │   ├── useSupabase.ts        # Client Supabase
│   │   ├── useAuth.ts            # Authentification
│   │   ├── useScanner.ts         # Logique scanner
│   │   ├── usePayment.ts         # Logique paiement
│   │   └── useHaptic.ts          # Retour haptique
│   │
│   ├── lib/                      # Utilitaires
│   │   ├── supabase/             # Configuration Supabase
│   │   ├── qrcode.ts             # Encodage/decodage QR
│   │   └── utils.ts              # Fonctions utilitaires
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── authStore.ts          # Etat authentification
│   │   ├── clientStore.ts        # Donnees client scanne
│   │   └── paymentStore.ts       # Etat paiement
│   │
│   └── types/                    # Types TypeScript
│       ├── supabase.ts           # Types generes Supabase
│       └── index.ts              # Types applicatifs
│
├── public/
│   ├── manifest.json             # Configuration PWA
│   └── icons/                    # Icones PWA
│
└── next.config.js                # Configuration Next.js + PWA
```

---

## Fonctionnalites

### F1 - Authentification

| ID | Fonctionnalite | Description |
|----|----------------|-------------|
| F1.1 | Connexion | Authentification via Supabase Auth (email/password) |
| F1.2 | Verification role | Verifier que l'utilisateur a un role autorise |
| F1.3 | Verification etablissement | Verifier que l'utilisateur est lie a un etablissement |
| F1.4 | Deconnexion | Deconnexion et redirection vers login |
| F1.5 | Session persistante | Maintien de la session via cookies |

### F2 - Scanner QR Code

| ID | Fonctionnalite | Description |
|----|----------------|-------------|
| F2.1 | Activation camera | Demande de permission et activation camera arriere |
| F2.2 | Detection QR | Detection automatique des QR codes dans le cadre |
| F2.3 | Decodage UUID | Transformation `0x0x0x0` → `-` pour obtenir l'UUID |
| F2.4 | Feedback haptique | Vibration au scan valide |
| F2.5 | Recuperation client | Chargement des donnees client depuis Supabase |

### F3 - Affichage informations client

| ID | Fonctionnalite | Description |
|----|----------------|-------------|
| F3.1 | Identite | Nom, prenom, username, avatar |
| F3.2 | Statistiques | XP total, niveau |
| F3.3 | Solde cashback | Paraiges de Bronze disponibles |
| F3.4 | Coupons | Liste des coupons non utilises |
| F3.5 | Contact | Email, telephone (optionnel) |

### F4 - Enregistrement paiement

| ID | Fonctionnalite | Description |
|----|----------------|-------------|
| F4.1 | Saisie montant | Champ numerique pour le montant en centimes |
| F4.2 | Selection mode | Choix UNIQUE parmi : Paraiges, Cashpad, Coupon |
| F4.3 | Validation cashback | Bloquer si solde insuffisant |
| F4.4 | Selection coupon | Liste des coupons applicables |
| F4.5 | Confirmation | Bouton de validation finale |
| F4.6 | Feedback haptique | Vibration a la validation |
| F4.7 | Animation succes | Animation visuelle de confirmation |
| F4.8 | Creation receipt | Appel RPC `create_receipt` |

### F5 - Historique des transactions

| ID | Fonctionnalite | Description |
|----|----------------|-------------|
| F5.1 | Liste transactions | Transactions creees par le serveur connecte |
| F5.2 | Filtrage date | Filtre par periode (aujourd'hui, semaine, mois) |
| F5.3 | Details transaction | Montant, client, mode de paiement, date |
| F5.4 | Pagination | Chargement progressif des transactions |

---

## Flux utilisateur

### Flux principal : Enregistrement d'un paiement

1. **Authentification** : Login email/password + verification role et etablissement
2. **Scanner** : Camera active, cadre de scan, detection QR code + vibration
3. **Chargement client** : Requetes profiles, user_stats, coupons
4. **Affichage client** : Avatar, nom, XP, niveau, solde cashback, coupons disponibles
5. **Formulaire paiement** : Saisie montant, selection mode (Paraiges desactive si solde insuffisant)
6. **Confirmation** : Vibration + animation succes, affichage XP et cashback gagnes

### Flux alternatif : Historique

1. **Navigation** : Menu vers Historique
2. **Affichage** : Liste des transactions avec filtre par periode
3. **Details** : Heure, nom client, montant, mode de paiement
4. **Pagination** : Chargement progressif (infinite scroll)

---

## Modele de donnees

### Tables Supabase utilisees

#### profiles (lecture)

```typescript
interface Profile {
  id: string;                        // UUID
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  birthdate: string | null;
  role: 'client' | 'employee' | 'admin' | 'establishment';
  attached_establishment_id: number | null;
  xp_coefficient: number;            // Default: 100
  cashback_coefficient: number;      // Default: 100
}
```

#### user_stats (vue materialisee - lecture)

```typescript
interface UserStats {
  customer_id: string;               // UUID
  total_xp: number;
  cashback_earned: number;
  cashback_spent: number;
  cashback_available: number;        // = earned - spent
}
```

#### coupons (lecture)

```typescript
interface Coupon {
  id: number;
  customer_id: string;
  used: boolean;
  amount: number | null;             // Montant fixe en centimes
  percentage: number | null;         // Pourcentage de reduction
  expires_at: string | null;         // Date d'expiration
  template_id: number | null;
  distribution_type: string | null;
}
```

#### receipts (creation)

```typescript
interface Receipt {
  id: number;
  created_at: string;
  amount: number;                    // Montant total en centimes
  customer_id: string;
  establishment_id: number;
  created_by: string;                // UUID du serveur (A AJOUTER)
}
```

#### receipt_lines (creation via RPC)

```typescript
interface ReceiptLine {
  id: number;
  receipt_id: number;
  amount: number;
  payment_method: 'card' | 'cash' | 'cashback' | 'coupon';
}
```

### Types applicatifs

```typescript
// Client scanne avec toutes ses informations
interface ScannedClient {
  // Identite
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;

  // Statistiques
  totalXp: number;
  level: number;                     // Calcule depuis XP

  // Cashback (Paraiges de Bronze)
  cashbackAvailable: number;

  // Coupons disponibles
  coupons: AvailableCoupon[];
}

interface AvailableCoupon {
  id: number;
  type: 'amount' | 'percentage';
  value: number;                     // Centimes ou pourcentage
  expiresAt: string | null;
  label: string;                     // Ex: "3,90€" ou "5%"
}

// Modes de paiement
type PaymentMode = 'paraiges' | 'cashpad' | 'coupon';

// Sous-types Cashpad
type CashpadMethod = 'card' | 'cash';

// Payload pour create_receipt
interface CreateReceiptPayload {
  p_customer_id: string;
  p_establishment_id: number;
  p_payment_methods: PaymentMethod[];
  p_coupon_ids?: number[];
}

interface PaymentMethod {
  method: 'card' | 'cash' | 'cashback';
  amount: number;
}
```

---

## Integration Supabase

### Fonction RPC : create_receipt

La fonction `create_receipt` gere toute la logique de creation d'un paiement :

```typescript
const { data, error } = await supabase.rpc('create_receipt', {
  p_customer_id: clientId,
  p_establishment_id: establishmentId,
  p_payment_methods: [
    { method: 'card', amount: 2500 }  // 25,00€
  ],
  p_coupon_ids: []  // Optionnel
});
```

#### Reponse succes

```json
{
  "success": true,
  "receipt_id": 123,
  "total_amount": 2500,
  "payment_amount": 2500,
  "coupon_amount": 0,
  "gains": {
    "gain_id": 456,
    "xp_gained": 25,
    "cashback_gained": 12
  }
}
```

#### Mapping modes de paiement

| Mode UI | Methode RPC | Genere gains |
|---------|-------------|--------------|
| Paraiges de Bronze | `cashback` | Non |
| Cashpad (Carte) | `card` | Oui |
| Cashpad (Especes) | `cash` | Oui |
| Coupon | `coupon` (via `p_coupon_ids`) | Non |

### Requetes de lecture

#### Recuperer les infos client apres scan

```typescript
// 1. Profil de base
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', customerId)
  .single();

// 2. Statistiques (vue materialisee)
const { data: stats } = await supabase
  .from('user_stats')
  .select('*')
  .eq('customer_id', customerId)
  .single();

// 3. Coupons disponibles
const { data: coupons } = await supabase
  .from('coupons')
  .select('id, amount, percentage, expires_at')
  .eq('customer_id', customerId)
  .eq('used', false)
  .or('expires_at.is.null,expires_at.gt.now()');
```

#### Historique des transactions du serveur

```typescript
const { data: history } = await supabase
  .from('receipts')
  .select(`
    id,
    created_at,
    amount,
    customer_id,
    profiles!receipts_customer_id_fkey (
      first_name,
      last_name,
      username
    ),
    receipt_lines (
      amount,
      payment_method
    )
  `)
  .eq('created_by', currentUserId)  // Champ a ajouter
  .eq('establishment_id', establishmentId)
  .order('created_at', { ascending: false })
  .range(0, 19);
```

---

## Interface utilisateur

### Ecrans principaux

#### 1. Login (`/login`)

- Formulaire email/password
- Message d'erreur si role non autorise
- Redirection vers scanner apres connexion

#### 2. Scanner (`/` - page principale)

- Camera plein ecran avec cadre de detection
- Bouton pour basculer camera (front/back)
- Indicateur de statut ("Pret a scanner", "Detection...")
- Acces menu (hamburger ou navigation bottom)

#### 3. Fiche Client (`/client/[id]`)

- Header avec avatar et nom
- Section statistiques (XP, niveau)
- Section Paraiges de Bronze (solde)
- Section coupons (liste scrollable)
- Bouton "Enregistrer un paiement"

#### 4. Paiement (`/payment`)

- Champ montant (clavier numerique)
- Selection mode de paiement (radio buttons)
- Liste coupons (si mode coupon)
- Bouton validation
- Animation de succes

#### 5. Historique (`/history`)

- Filtre par periode
- Liste des transactions (cards)
- Pull-to-refresh
- Infinite scroll

### Feedback utilisateur

#### Retour haptique (vibration)

```typescript
// Hook useHaptic
function useHaptic() {
  const vibrate = (pattern: 'light' | 'medium' | 'success') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [50],
        medium: [100],
        success: [50, 50, 100]
      };
      navigator.vibrate(patterns[pattern]);
    }
  };

  return { vibrate };
}
```

**Declenchements :**
- Scan QR valide → `vibrate('medium')`
- Paiement valide → `vibrate('success')`

#### Animation de validation

```typescript
// Composant SuccessAnimation
function SuccessAnimation({ visible, onComplete }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onAnimationComplete={onComplete}
          className="fixed inset-0 flex items-center justify-center bg-black/50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="bg-green-500 rounded-full p-8"
          >
            <CheckIcon className="w-16 h-16 text-white" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Design system

| Element | Valeur |
|---------|--------|
| Couleur primaire | `#1a1a1a` (dark) |
| Couleur accent | `#D4AF37` (or) |
| Couleur succes | `#22c55e` (green-500) |
| Police | System font stack |
| Border radius | `8px` (cards), `12px` (buttons) |

---

## Securite

### Authentification

- Session geree par Supabase Auth
- Cookies HTTPOnly pour le token
- Refresh automatique du token

### Autorisation

- **RLS (Row Level Security)** active sur toutes les tables
- Verification cote serveur du role et de l'etablissement
- Les receipts ne peuvent etre crees que pour l'etablissement du serveur

### Validation des donnees

```typescript
// Validation avant creation receipt
function validatePayment(client: ScannedClient, amount: number, mode: PaymentMode) {
  // Montant positif
  if (amount <= 0) {
    throw new Error('Le montant doit etre positif');
  }

  // Verification solde cashback
  if (mode === 'paraiges' && client.cashbackAvailable < amount) {
    throw new Error('Solde Paraiges insuffisant');
  }

  // Verification coupon
  if (mode === 'coupon' && client.coupons.length === 0) {
    throw new Error('Aucun coupon disponible');
  }
}
```

---

## Contraintes techniques

### Connectivite

- **Connexion internet obligatoire** pour toutes les operations
- Afficher un message d'erreur clair en cas de perte de connexion
- Pas de mode offline / synchronisation

### PWA

- Mode `standalone` (pas de barre navigateur)
- Orientation `portrait` uniquement
- Theme sombre (`#1a1a1a`)
- Service worker pour cache des assets statiques

### Permissions

- **Camera** : Obligatoire pour le scanner
- **Vibration** : Optionnelle (feedback haptique)

### Compatibilite

- Navigateurs modernes (Chrome, Safari, Firefox)
- iOS 15+ / Android 10+
- Ecrans 320px minimum

---

## Migration base de donnees requise

### Ajout du champ `created_by` sur `receipts`

Pour permettre le filtrage de l'historique par serveur, il faut ajouter un champ `created_by` a la table `receipts` :

```sql
-- Migration: add_created_by_to_receipts
ALTER TABLE receipts
ADD COLUMN created_by UUID REFERENCES profiles(id);

-- Index pour les requetes d'historique
CREATE INDEX idx_receipts_created_by ON receipts(created_by);

-- Mise a jour de la fonction create_receipt pour inclure created_by
-- (utilise auth.uid() pour identifier le serveur)
```

---

## Glossaire

| Terme | Definition |
|-------|------------|
| Paraiges de Bronze | Monnaie virtuelle / cashback du Royaume des Paraiges |
| Cashpad | Terminal de paiement physique (carte bancaire ou especes) |
| Receipt | Ticket / transaction enregistree dans le systeme |
| XP | Points d'experience gagnes par le client |
| Coupon | Bon de reduction (montant fixe ou pourcentage) |

---

## Changelog

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-02-04 | Version initiale des specifications |
