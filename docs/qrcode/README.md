# Documentation QR Code

## Introduction

Cette section documente le systeme de QR codes utilise dans l'ecosysteme Royaume des Paraiges. Le systeme permet aux clients de partager leur profil et aux employes de scanner ces QR codes pour identifier les clients lors des transactions.

## Table des matieres

- [Generation des QR Codes](./generation.md) - Creation et affichage (royaume-paraiges-front)
- [Scan des QR Codes](./scanning.md) - Lecture et traitement (royaume-paraiges-waiters)
- [Integration Scanner PWA](./scanner-pwa.md) - Application dediee (royaume-paraiges-scanner)

## Vue d'ensemble

### Architecture du systeme

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ECOSYSTEME QR CODE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────┐         ┌─────────────────────┐            │
│  │  royaume-paraiges-  │         │  royaume-paraiges-  │            │
│  │       front         │         │      waiters        │            │
│  │                     │         │                     │            │
│  │  - Generation QR    │         │  - Scan hardware    │            │
│  │  - Affichage modal  │         │  - Keyboard events  │            │
│  │  - Scan camera      │         │  - Liste d'attente  │            │
│  │    (employes)       │         │                     │            │
│  └──────────┬──────────┘         └──────────┬──────────┘            │
│             │                               │                        │
│             │      ┌─────────────────┐      │                        │
│             │      │  royaume-       │      │                        │
│             └─────►│  paraiges-      │◄─────┘                        │
│                    │  scanner (PWA)  │                               │
│                    │                 │                               │
│                    │  - Scan camera  │                               │
│                    │  - html5-qrcode │                               │
│                    └─────────────────┘                               │
│                             │                                        │
│                             ▼                                        │
│                    ┌─────────────────┐                               │
│                    │    Supabase     │                               │
│                    │                 │                               │
│                    │  - profiles     │                               │
│                    │  - receipts     │                               │
│                    │  - gains        │                               │
│                    │  - coupons      │                               │
│                    └─────────────────┘                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Donnees encodees

Le QR code contient **l'UUID du client** avec un encodage special :

| Element | Valeur |
|---------|--------|
| Format | UUID v4 (ex: `e15fd582-e2a1-4280-8ff9-3f19648d3824`) |
| Encodage | Les tirets (`-`) sont remplaces par `0x0x0x0` |
| Taille | 220x220 pixels (generation) |
| Couleurs | Noir sur blanc |

**Exemple de transformation :**
```
UUID original:  e15fd582-e2a1-4280-8ff9-3f19648d3824
                        ↓ (encodage)
QR Code data:   e15fd5820x0x0x0e2a10x0x0x042800x0x0x08ff90x0x0x03f19648d3824
                        ↓ (decodage)
UUID decode:    e15fd582-e2a1-4280-8ff9-3f19648d3824
```

## Applications

### 1. royaume-paraiges-front (Mobile/Web)

**Role** : Generation et affichage des QR codes clients + Scan pour employes

| Fonctionnalite | Composant | Description |
|----------------|-----------|-------------|
| Affichage QR | `QrCodeModal.tsx` | Modal avec QR code du client |
| Bouton flottant | `FloatingQrCode.tsx` | Acces rapide au QR code |
| Scan mobile | `ScannerModal.tsx` | Scanner camera (Expo) |
| Scan web | `WebQrScanner.web.tsx` | Scanner navigateur (html5-qrcode) |

**Bibliotheques** :
- `react-native-qrcode-svg` - Generation QR
- `expo-camera` - Scan mobile
- `html5-qrcode` - Scan web

### 2. royaume-paraiges-waiters (Desktop)

**Role** : Scan des QR codes via scanner hardware (clavier)

| Fonctionnalite | Fichier | Description |
|----------------|---------|-------------|
| Hook de scan | `useQRCodeScanner.ts` | Interception clavier |
| Composant global | `GlobalScanner.tsx` | Activation globale |
| Liste d'attente | `WaitingListCard.tsx` | Gestion des clients |

**Approche** : Pas de camera - utilise les scanners hardware qui emulent un clavier

### 3. royaume-paraiges-scanner (PWA)

**Role** : Application PWA dediee au scan par camera

| Fonctionnalite | Bibliotheque | Description |
|----------------|--------------|-------------|
| Scan camera | `html5-qrcode` | Scan via camera du device |
| PWA | `next-pwa` | Application installable |

## Flux utilisateur

### Scenario 1 : Client affiche son QR code

```
1. Client ouvre l'app mobile/web (royaume-paraiges-front)
2. Clique sur le bouton flottant QR code
3. QrCodeModal s'ouvre avec son UUID encode
4. L'employe scanne ce QR code
```

### Scenario 2 : Employe scanne un client (Scanner hardware)

```
1. Employe sur royaume-paraiges-waiters
2. Client presente son QR code
3. Scanner hardware lit le QR code
4. Hook useQRCodeScanner intercepte les frappes clavier
5. UUID decode et client ajoute a la liste d'attente
6. Employe peut servir le client
```

### Scenario 3 : Employe scanne un client (Camera)

```
1. Employe sur royaume-paraiges-front ou royaume-paraiges-scanner
2. Ouvre le scanner camera
3. Scanne le QR code du client
4. Redirection vers la page profil client
```

## Tables Supabase impliquees

| Table | Utilisation |
|-------|-------------|
| `profiles` | Source de l'UUID pour le QR code |
| `receipts` | Tickets crees apres scan |
| `gains` | XP et cashback associes |
| `coupons` | Coupons du client scannes |
| `spendings` | Depenses cashback |

## Fonctions RPC utilisees

| Fonction | Description |
|----------|-------------|
| `create_receipt` | Cree un ticket apres service du client |
| `get_customer_available_coupons` | Recupere les coupons utilisables |

## Securite

- **RLS active** sur toutes les tables
- Seuls les employes/admins peuvent scanner et voir les profils clients
- Les UUIDs ne contiennent pas d'informations personnelles sensibles

## Derniere mise a jour

- **Date** : 2026-02-04
- **Version** : 1.0.0
