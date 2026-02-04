# Generation des QR Codes

> **Application** : royaume-paraiges-front

## Vue d'ensemble

La generation des QR codes permet aux clients d'afficher leur identifiant unique sous forme de QR code scannable par les employes lors du passage en caisse.

## Bibliotheques utilisees

| Bibliotheque | Version | Utilisation |
|--------------|---------|-------------|
| `react-native-qrcode-svg` | 6.3.15 | Generation QR mobile/web |
| `qrcode` | 1.5.4 | Encodage QR core |
| `qr-image` | 3.2.0 | Utilitaire QR additionnel |

## Composants

### QrCodeModal

**Fichier** : `components/layout/QrCodeModal.tsx`

Modal affichant le QR code personnel du client avec ses statistiques.

```typescript
interface QrCodeModalProps {
  visible: boolean;
  onClose: () => void;
  qrCodeData?: string;  // UUID du client
  xp?: number;
  cashback?: number;
}
```

**Caracteristiques** :
- Taille QR : 220x220 pixels
- Couleurs : Noir (#000000) sur blanc (#FFFFFF)
- Animation : Fade-in + scale-up
- Affiche XP et cashback du client
- Message : "Scannez ce QR code au comptoir pour partager votre profil"

**Encodage des donnees** :
```typescript
// Les tirets sont remplaces pour eviter les problemes d'encodage
const encodedData = userId.replace(/-/g, '0x0x0x0');
```

### FloatingQrCode

**Fichier** : `components/common/FloatingQrCode.tsx`

Bouton flottant permettant d'ouvrir rapidement le QR code.

**Caracteristiques** :
- Position : Bas-droite de l'ecran
- Mobile : 80px du bas
- Web : 24px du bas
- Style : Glassmorphisme avec bordure degradee
- Action : Ouvre `QrCodeModal` via `openQrCodeModal()`

## Gestion d'etat

### ScrollContext

**Fichier** : `contexts/ScrollContext.tsx`

Contexte gerant l'etat du modal QR code globalement.

```typescript
interface ScrollContextType {
  qrCodeModalVisible: boolean;
  openQrCodeModal: () => void;
  closeQrCodeModal: () => void;
  // ... autres proprietes
}
```

**Usage** :
```typescript
'use client';
import { useScroll } from '@/contexts/ScrollContext';

function MyComponent() {
  const { openQrCodeModal, qrCodeModalVisible } = useScroll();

  return (
    <Button onPress={openQrCodeModal}>
      Afficher mon QR code
    </Button>
  );
}
```

## Flux de generation

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUX DE GENERATION QR                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. INITIALISATION                                               │
│     ┌──────────────────┐                                        │
│     │  App Layout      │                                        │
│     │  (_layout.tsx)   │                                        │
│     │                  │                                        │
│     │  - ScrollProvider│                                        │
│     │  - QrCodeModal   │                                        │
│     └────────┬─────────┘                                        │
│              │                                                   │
│  2. DECLENCHEMENT                                                │
│              ▼                                                   │
│     ┌──────────────────┐                                        │
│     │ FloatingQrCode   │                                        │
│     │                  │                                        │
│     │ onClick:         │                                        │
│     │ openQrCodeModal()│                                        │
│     └────────┬─────────┘                                        │
│              │                                                   │
│  3. AFFICHAGE                                                    │
│              ▼                                                   │
│     ┌──────────────────┐                                        │
│     │ QrCodeModal      │                                        │
│     │                  │                                        │
│     │ - Recoit user.id │                                        │
│     │ - Encode tirets  │                                        │
│     │ - Genere SVG     │                                        │
│     │ - Affiche stats  │                                        │
│     └──────────────────┘                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Configuration du QR code

```typescript
<QRCode
  value={encodedUserId}
  size={220}
  color="black"
  backgroundColor="white"
  // Pas de logo/gradient pour maximiser la lisibilite
/>
```

## Donnees affichees

Le modal affiche egalement :

| Donnee | Source | Description |
|--------|--------|-------------|
| XP | `user_stats.total_xp` | Points d'experience |
| Cashback | `user_stats.cashback_available` | Cashback disponible |

## Integration dans l'app

### Layout principal

```typescript
// app/_layout.tsx
<ScrollProvider>
  <QrCodeModal
    visible={qrCodeModalVisible}
    onClose={closeQrCodeModal}
    qrCodeData={user?.id}
    xp={userStats?.total_xp}
    cashback={userStats?.cashback_available}
  />
  {/* Reste de l'app */}
</ScrollProvider>
```

### Bouton flottant

```typescript
// Dans les pages/tabs
<FloatingQrCode />
```

## Securite

- L'UUID ne contient pas d'informations personnelles
- Le QR code n'est genere que pour les utilisateurs connectes
- Les donnees sensibles (email, nom) ne sont pas dans le QR code

## Valeur par defaut

Si aucun utilisateur n'est connecte :
```typescript
const fallbackData = 'https://royaume-paraiges.fr';
```

## Derniere mise a jour

- **Date** : 2026-02-04
