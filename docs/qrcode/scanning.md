# Scan des QR Codes (Waiters)

> **Application** : royaume-paraiges-waiters

## Vue d'ensemble

L'application waiters utilise une approche unique pour scanner les QR codes : elle intercepte les frappes clavier emises par les scanners hardware (pistolets code-barres) qui emulent un clavier USB.

## Principe de fonctionnement

Les scanners hardware QR code fonctionnent comme des claviers :
1. Le scanner lit le QR code
2. Il envoie les caracteres un par un tres rapidement (< 100ms entre chaque)
3. Il termine par la touche `Enter`

L'application detecte cette frappe rapide pour distinguer un scan d'une saisie manuelle.

## Bibliotheques utilisees

**Aucune bibliotheque externe** - Implementation pure JavaScript/TypeScript utilisant :
- `document.addEventListener('keydown', ...)` - Ecoute clavier
- `KeyboardEvent` API native

## Hook principal

### useQRCodeScanner

**Fichier** : `src/hooks/useQRCodeScanner.ts`

```typescript
interface UseQRCodeScannerOptions {
  onScan: (data: string) => void;
  enabled?: boolean;
}

function useQRCodeScanner({ onScan, enabled = true }: UseQRCodeScannerOptions): void
```

**Logique de detection** :

```typescript
// Seuil de temps entre les frappes
const SCAN_THRESHOLD_MS = 100;

function handleKeyDown(e: KeyboardEvent) {
  const now = Date.now();
  const delta = now - lastTime;

  // Si trop lent = frappe manuelle, on reset
  if (delta > SCAN_THRESHOLD_MS) {
    buffer = '';
  }

  // Accumule les caracteres
  if (e.key.length === 1) {
    buffer += e.key;
  }

  // Enter = fin du scan
  if (e.key === 'Enter' && buffer.length > 0) {
    e.preventDefault();
    const decoded = buffer.replace(/0x0x0x0/g, '-');
    onScan(decoded);
    buffer = '';
  }

  lastTime = now;
}
```

**Filtrage des inputs** :

```typescript
// Ignore si l'utilisateur tape dans un champ de formulaire
const target = e.target as HTMLElement;
if (
  target.tagName === 'INPUT' ||
  target.tagName === 'TEXTAREA' ||
  target.isContentEditable
) {
  return;
}
```

## Composants

### GlobalScanner

**Fichier** : `src/components/scanner/GlobalScanner.tsx`

Composant invisible monte au niveau racine pour activer le scan globalement.

```typescript
interface GlobalScannerProps {
  onClientScanned: (client: User) => void;
}

function GlobalScanner({ onClientScanned }: GlobalScannerProps) {
  const handleScan = async (userId: string) => {
    const user = await getUserByQRCode(userId);
    if (user) {
      onClientScanned(user);
    }
  };

  useQRCodeScanner({
    onScan: handleScan,
    enabled: true
  });

  return null; // Composant invisible
}
```

### WaitingListCard

**Fichier** : `src/components/waiting-list/WaitingListCard.tsx`

Affiche les clients scannes dans la liste d'attente.

**Informations affichees** :
- Photo de profil
- Nom et prenom
- Heure du scan
- Duree d'attente (temps reel)
- Boutons d'action (Servir, Attente, Supprimer)

### PendingClientBadge

**Fichier** : `src/components/waiting-list/PendingClientBadge.tsx`

Badge de notification quand un client est scanne pendant qu'un autre est en service.

- Position : Haut-gauche
- Auto-disparition : 3 secondes
- Action : Clic pour basculer sur le nouveau client

### SimulateScanButton

**Fichier** : `src/components/sidebar/SimulateScanButton.tsx`

Bouton de developpement pour simuler un scan sans scanner hardware.

- Visible uniquement en mode developpement
- Permet de saisir un UUID manuellement
- Inclut 6 UUIDs de test pre-configures

## Flux de scan

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLUX DE SCAN HARDWARE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. SCAN PHYSIQUE                                                    │
│     ┌──────────────────┐                                            │
│     │ Scanner Hardware │                                            │
│     │ (pistolet QR)    │                                            │
│     │                  │                                            │
│     │ Emule clavier    │                                            │
│     │ USB/Bluetooth    │                                            │
│     └────────┬─────────┘                                            │
│              │ frappes rapides (<100ms)                             │
│              ▼                                                       │
│  2. INTERCEPTION                                                     │
│     ┌──────────────────┐                                            │
│     │ useQRCodeScanner │                                            │
│     │                  │                                            │
│     │ - Buffer chars   │                                            │
│     │ - Detect timing  │                                            │
│     │ - Wait Enter     │                                            │
│     └────────┬─────────┘                                            │
│              │ UUID decode                                           │
│              ▼                                                       │
│  3. RECUPERATION DONNEES                                             │
│     ┌──────────────────┐                                            │
│     │ getUserByQRCode  │                                            │
│     │                  │                                            │
│     │ Requetes :       │                                            │
│     │ - profiles       │                                            │
│     │ - receipts       │                                            │
│     │ - gains          │                                            │
│     │ - spendings      │                                            │
│     │ - coupons        │                                            │
│     └────────┬─────────┘                                            │
│              │ User object                                           │
│              ▼                                                       │
│  4. MISE A JOUR ETAT                                                 │
│     ┌──────────────────┐                                            │
│     │ Redux Store      │                                            │
│     │                  │                                            │
│     │ Actions :        │                                            │
│     │ - addToWaitList  │                                            │
│     │ - setJsonData    │                                            │
│     │ - setLoading     │                                            │
│     └────────┬─────────┘                                            │
│              │                                                       │
│              ▼                                                       │
│  5. AFFICHAGE                                                        │
│     ┌──────────────────┐                                            │
│     │ WaitingListCard  │                                            │
│     │ ou               │                                            │
│     │ PendingBadge     │                                            │
│     └──────────────────┘                                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Gestion d'etat Redux

### qrcodeSlice

```typescript
interface QRCodeState {
  loading: boolean;
  error: string | null;
  jsonData: User | null;
}
```

### waitingListSlice

```typescript
interface WaitingClient extends User {
  scannedAt: string;      // ISO timestamp
  status: 'waiting' | 'serving';
}

interface WaitingListState {
  clients: WaitingClient[];
}

// Actions
addClientToWaitingList(client)
removeClientFromWaitingList(clientId)
setClientServing(clientId)
setClientWaiting(clientId)
```

### settingsSlice

```typescript
interface SettingsState {
  scanQRCode: boolean;  // Active/desactive le scan
}
```

## Context de changement de client

### SwitchClientContext

**Fichier** : `src/contexts/SwitchClientContext.tsx`

Gere le cas ou un client est scanne pendant qu'un autre est deja en service.

```typescript
interface SwitchClientContextType {
  pendingClient: User | null;
  setPendingClient: (client: User | null) => void;
  showSwitchModal: boolean;
  setShowSwitchModal: (show: boolean) => void;
}
```

## Requetes Supabase

### getUserByQRCode

**Fichier** : `src/lib/supabase/api.ts`

Agregation de 6 requetes pour construire le profil complet :

```typescript
async function getUserByQRCode(userId: string): Promise<User | null> {
  // 1. Profil de base
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // 2. Tickets
  const { data: receipts } = await supabase
    .from('receipts')
    .select('id, amount, customer_id')
    .eq('customer_id', userId);

  // 3. Gains (XP et cashback)
  const { data: gains } = await supabase
    .from('gains')
    .select('xp, cashback_money, receipt_id')
    .in('receipt_id', receiptIds);

  // 4. Depenses cashback
  const { data: spendings } = await supabase
    .from('spendings')
    .select('amount')
    .eq('customer_id', userId);

  // 5. Coupons disponibles
  const { data: coupons } = await supabase
    .from('coupons')
    .select('id, amount, percentage, expires_at, created_at')
    .eq('customer_id', userId)
    .eq('used', false)
    .order('created_at', { ascending: false });

  // 6. Construction de l'objet User
  return {
    id: userId,
    username: profile.username,
    firstName: profile.first_name,
    lastName: profile.last_name,
    // ... autres champs
    xp: totalXp,
    cashbackAvailable: totalCashback - totalSpentCashback,
    discounts: formattedCoupons
  };
}
```

## Gestion des erreurs

| Erreur | Message |
|--------|---------|
| Utilisateur non trouve | "Utilisateur non trouve. Veuillez reessayer." |
| Erreur base de donnees | "Erreur lors de la recuperation des donnees. Veuillez reessayer." |

Les erreurs ne suppriment pas les donnees client existantes pour preserver l'interface.

## Scenarios multi-clients

### Scenario A : Aucun client en service

```
Scan → Loading → Client ajoute a la liste → Affichage
```

### Scenario B : Client deja en service

```
Scan → Pas de loading → PendingClientBadge (3s) → Clic → SwitchClientModal
```

## Structure des fichiers

```
royaume-paraiges-waiters/
├── src/
│   ├── hooks/
│   │   └── useQRCodeScanner.ts        # Hook principal
│   ├── components/
│   │   ├── scanner/
│   │   │   ├── GlobalScanner.tsx      # Composant global
│   │   │   └── WaitForScanIndicator.tsx
│   │   ├── waiting-list/
│   │   │   ├── WaitingListCard.tsx    # Carte client
│   │   │   └── PendingClientBadge.tsx # Badge notification
│   │   └── sidebar/
│   │       └── SimulateScanButton.tsx # Test dev
│   ├── store/
│   │   ├── qrcodeSlice.js
│   │   ├── waitingListSlice.js
│   │   └── settingsSlice.js
│   ├── contexts/
│   │   └── SwitchClientContext.tsx
│   └── lib/
│       └── supabase/
│           └── api.ts                 # getUserByQRCode
```

## Configuration scanner hardware

Pour que le scanner fonctionne correctement :
- Mode : HID Keyboard (pas serie)
- Suffixe : Enter/Return (touche 13)
- Vitesse : Maximum (le hook gere toutes les vitesses)

## Derniere mise a jour

- **Date** : 2026-02-04
