# Scanner PWA et Scan Camera

> **Applications** : royaume-paraiges-scanner (PWA) et royaume-paraiges-front (employes)

## Vue d'ensemble

En complement du scan hardware, l'ecosysteme propose des solutions de scan par camera :
1. **royaume-paraiges-scanner** : PWA dediee au scan
2. **royaume-paraiges-front** : Scan integre pour employes/admins

## Bibliotheques utilisees

| Bibliotheque | Version | Plateforme | Utilisation |
|--------------|---------|------------|-------------|
| `html5-qrcode` | 2.3.8 | Web | Scanner navigateur |
| `expo-camera` | 17.0.10 | Mobile | Scanner React Native |

## royaume-paraiges-scanner (PWA)

### Configuration PWA

**Fichier** : `next.config.js`

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // Next.js config
});
```

**Manifest** : `public/manifest.json`

```json
{
  "name": "Royaume Scanner",
  "short_name": "Scanner",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1a1a1a",
  "background_color": "#1a1a1a"
}
```

### Caracteristiques

- Mode standalone (pas de barre navigateur)
- Orientation portrait uniquement
- Theme sombre (#1a1a1a)
- Service worker pour cache offline
- Support Apple Touch Icon

## royaume-paraiges-front (Scan employes)

### Composants de scan

#### ScannerModal

**Fichier** : `components/layout/ScannerModal.tsx`

Modal de scan cross-platform (mobile + web).

```typescript
interface ScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}
```

**Detection de plateforme** :
```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  return <WebQrScanner onScan={onScan} />;
} else {
  return <MobileCameraScanner onScan={onScan} />;
}
```

#### WebQrScanner (Web)

**Fichier** : `components/layout/WebQrScanner.web.tsx`

Scanner camera pour navigateurs web.

```typescript
import { Html5Qrcode } from 'html5-qrcode';

function WebQrScanner({ onScan }: { onScan: (data: string) => void }) {
  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');

    // Delai pour initialisation DOM
    const timer = setTimeout(() => {
      scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          const userId = decodedText.replace(/0x0x0x0/g, '-');
          onScan(userId);
        }
      );
    }, 150);

    return () => {
      clearTimeout(timer);
      scanner.stop().catch(console.error);
    };
  }, []);

  return <div id="qr-reader" />;
}
```

**Configuration camera** :
- Camera arriere (`facingMode: 'environment'`)
- 10 FPS
- Zone de detection : 250x250 pixels
- Ratio 1:1

#### Fallback non-web

**Fichier** : `components/layout/WebQrScanner.tsx`

```typescript
function WebQrScanner() {
  return (
    <View>
      <Text>Ce composant est uniquement disponible sur web</Text>
    </View>
  );
}
```

### Scanner Mobile (Expo)

**Dans ScannerModal.tsx** :

```typescript
import { CameraView, useCameraPermissions } from 'expo-camera';

function MobileCameraScanner({ onScan }) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission?.granted) {
    return (
      <View>
        <Text>Permission camera requise</Text>
        <Button onPress={requestPermission}>Autoriser</Button>
      </View>
    );
  }

  return (
    <CameraView
      style={{ flex: 1 }}
      facing="back"
      barcodeScannerSettings={{
        barcodeTypes: ['qr']
      }}
      onBarcodeScanned={({ data }) => {
        const userId = data.replace(/0x0x0x0/g, '-');
        onScan(userId);
      }}
    />
  );
}
```

**Configuration** :
- Camera arriere (`facing: 'back'`)
- Filtre : QR codes uniquement
- Gestion permissions native

## Flux de scan camera

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FLUX DE SCAN CAMERA                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. OUVERTURE SCANNER                                                │
│     ┌──────────────────────────────────────────────────────────┐    │
│     │ ScannerModal                                              │    │
│     │                                                           │    │
│     │ ┌─────────────────┐    ┌─────────────────┐               │    │
│     │ │ Platform = web  │    │ Platform = ios/ │               │    │
│     │ │                 │    │        android  │               │    │
│     │ │ WebQrScanner    │    │ CameraView      │               │    │
│     │ │ (html5-qrcode)  │    │ (expo-camera)   │               │    │
│     │ └────────┬────────┘    └────────┬────────┘               │    │
│     │          │                      │                         │    │
│     └──────────┼──────────────────────┼─────────────────────────┘    │
│                │                      │                              │
│  2. DETECTION QR                                                     │
│                ▼                      ▼                              │
│     ┌──────────────────────────────────────────────────────────┐    │
│     │ QR Code detecte                                           │    │
│     │                                                           │    │
│     │ Data brute: "e15fd5820x0x0x0e2a1..."                     │    │
│     └────────────────────────┬──────────────────────────────────┘    │
│                              │                                       │
│  3. DECODAGE                 ▼                                       │
│     ┌──────────────────────────────────────────────────────────┐    │
│     │ data.replace(/0x0x0x0/g, '-')                            │    │
│     │                                                           │    │
│     │ UUID: "e15fd582-e2a1-4280-8ff9-3f19648d3824"             │    │
│     └────────────────────────┬──────────────────────────────────┘    │
│                              │                                       │
│  4. CALLBACK                 ▼                                       │
│     ┌──────────────────────────────────────────────────────────┐    │
│     │ onScan(userId)                                            │    │
│     │                                                           │    │
│     │ - Ferme le modal (500ms delay)                           │    │
│     │ - hasScanned = true (prevent doubles)                    │    │
│     └────────────────────────┬──────────────────────────────────┘    │
│                              │                                       │
│  5. NAVIGATION               ▼                                       │
│     ┌──────────────────────────────────────────────────────────┐    │
│     │ router.push(`/client-scanner/${userId}`)                  │    │
│     │                                                           │    │
│     │ Affiche la page profil client                            │    │
│     └──────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Prevention des scans multiples

```typescript
const [hasScanned, setHasScanned] = useState(false);

const handleScan = (data: string) => {
  if (hasScanned) return;
  setHasScanned(true);

  // Traitement
  setTimeout(() => {
    onClose();
  }, 500);
};
```

## Gestion des permissions

### Web
- Navigateur demande automatiquement l'acces camera
- Erreur si refuse ou camera indisponible

### Mobile (Expo)
```typescript
const [permission, requestPermission] = useCameraPermissions();

if (permission === null) {
  return <Loading />;
}

if (!permission.granted) {
  return <PermissionRequest onRequest={requestPermission} />;
}
```

## Interface visuelle

### Cadre de scan

```typescript
// Zone de detection visuelle
<View style={styles.scanFrame}>
  <View style={styles.cornerTopLeft} />
  <View style={styles.cornerTopRight} />
  <View style={styles.cornerBottomLeft} />
  <View style={styles.cornerBottomRight} />
</View>
```

### Messages

| Etat | Message |
|------|---------|
| Initialisation | "Initialisation de la camera..." |
| Pret | "Placez le QR code dans le cadre" |
| Scan | "QR code detecte !" |
| Erreur camera | "Impossible d'acceder a la camera" |
| Erreur permission | "Permission camera requise" |

## Gestion des erreurs

### html5-qrcode

```typescript
scanner.start(/* ... */).catch((err) => {
  if (err.name === 'NotAllowedError') {
    setError('Permission camera refusee');
  } else if (err.name === 'NotFoundError') {
    setError('Aucune camera detectee');
  } else {
    setError('Erreur camera inconnue');
  }
});
```

### Cleanup

```typescript
useEffect(() => {
  return () => {
    // Important: arreter proprement pour liberer la camera
    if (scannerRef.current) {
      scannerRef.current.stop()
        .then(() => scannerRef.current.clear())
        .catch(console.error);
    }
  };
}, []);
```

## Acces au scanner

### royaume-paraiges-front

**Qui peut scanner ?**
- Role : `employee` ou `admin`
- Verifie dans `ClientProfileScreen`

**Comment ouvrir ?**
```typescript
const { openScannerModal } = useScroll();

// Dans le header ou menu employe
<Button onPress={openScannerModal}>
  Scanner un client
</Button>
```

### royaume-paraiges-scanner

- Application autonome
- Accessible a tout employe connecte
- Installable comme PWA sur l'ecran d'accueil

## Structure des fichiers

```
royaume-paraiges-front/
├── components/
│   └── layout/
│       ├── ScannerModal.tsx       # Modal principal
│       ├── WebQrScanner.web.tsx   # Scanner web
│       └── WebQrScanner.tsx       # Fallback

royaume-paraiges-scanner/
├── src/
│   ├── app/
│   │   └── page.tsx               # Page principale
│   └── components/
│       └── Scanner.tsx            # Composant scanner
├── public/
│   └── manifest.json              # Config PWA
└── next.config.js                 # Config PWA
```

## Comparaison des methodes

| Critere | Scanner Hardware | Camera Web | Camera Mobile |
|---------|------------------|------------|---------------|
| Vitesse | Instantane | ~500ms | ~300ms |
| Fiabilite | Excellente | Bonne | Tres bonne |
| Distance | 10-30 cm | 10-20 cm | 10-25 cm |
| Luminosite | Independant | Necessaire | Necessaire |
| Cout | ~50-100€ | Gratuit | Gratuit |
| Setup | Config USB | Aucun | Permissions |

## Derniere mise a jour

- **Date** : 2026-02-04
