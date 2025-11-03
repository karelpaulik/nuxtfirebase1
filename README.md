# Instalace
## firebase-tools
Pro používání:
- firebase login
- firebase init
- firebase deploy
```
npm install -g firebase-tools
```

## firebase
Pro používání:
- import { initializeApp } from "firebase/app";
- import { getFirestore } from 'firebase/firestore';
- import { getStorage } from "firebase/storage";
```
npm install firebase
```

## gcloud CLI
Pro:
- nastavení CORS na storage bucketu

### Instalace
```
Nutno stáhnout instalátor: GoogleCloudSDKInstaller.exe (velikost: 0,2 MB)
Stáhnout ze stránky: https://cloud.google.com/sdk/docs/install
Nainstalovtat - stačí uživatelský účet
- Turn on screeen reader mode: nevybírat

User
- Single user

Výběr component:
- Google Cloud CLI Core Libraries and Tools
- Bundled Python
Není třeba:
- Cloud Tools for PowerShell (pokud použiji gcloud z cmd, nepotřebuji)

Instaluje se do:
c:\users\jmeno.prijmeni\appdata\local\google\

Test, že nainstalováno:
- Měl by stačit běžný: cmd. 
- Google Cloud SDK Shell - asi nepřináší žádnou výhodu.
gcloud version
```


### Inicializace
```
gcloud init
```

### Další příkazy:
```
Kontrola konfigurace:
gcloud config list

Help:
gcloud -h       (list of available commands)
gcloud --help
gcloud topic --help
gcloud cheat-sheet

Pozn: základní příkazy
gcloud init: Initialize, authorize, and configure the gcloud CLI.
gcloud version: Display version and installed components.
gcloud components install: Install specific components.
gcloud components update: Update your gcloud CLI to the latest version.
gcloud config set project: Set a default Google Cloud project to work on.
gcloud info: Display current gcloud CLI environment details.
```

# Nastavení CORS
## Zobrazení souč. stavu
```
gcloud storage buckets describe gs://<NAZEV_VASEHO_BUCKETU>
```

## Nastavení nového CORS
1. Vytvoření cors.json
```
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

2. Spuštění příkazu:
- Nutno být ve stejném adresáři, kde je cors.json
```
gcloud storage buckets update gs://....app --cors-file=cors.json
```

# Zobrazení formátovaného textu ve VSCODE
Ctrl+K then V

# Nasazení na static hosting google.

```
npm run build
Vytvoří se .output/public

Do tohoto adresáře najet
cd .output

Provést deploy na google hosting.
firebase login
firebase init
firebase deploy
```

**Pozn** Zde se nepoužije *npm run generate*, protože je nastavení v: nuxt.config.ts
```
ssr: false
nitro.preset: 'static'
```

*npm run generate* se používá, když je:
```
ssr: true
```

# Typescirpt kontrola
```
Nastavení:
tsconfig.json
compilerOptions.strict: true/false

npm run typecheck

Vypnutí kontroly - přidávají se dvě lomítka + @příkaz

Vpnutí kontroly pro následující řádek:
// @ts-ignore
nebo nově:
// @ts-expect-error

Vpnutí kontroly pro celý soubor (uvést na začátek souboru):
// @ts-nocheck

```

# Quasar instalace
```
npm install quasar @quasar/extras
npx nuxi@latest module add quasar

Pozn. Tímto se automaticky quasar nastaví do nuxt.config.ts
```

# FullScreen
```
Nepoužívám, protože dělá problémy na mobilním telefonu.
Když vkádám do inputu na mob. telefonu, objeví se nahoře lišta (možnost vložení uložených hesel, platebních metod, adres) a překryje horní tollbary.
FullScreen tedy dělá problém na mobilním zařízením - když se vkládají informace do inputu.
Jinak asi OK.
```

# Validace
```
npm install vee-validate zod @vee-validate/zod

Definice schematu:
schemas/userSchema.ts

Validace na vstupu:
composables/useDocHandlers.ts

Validace formuláře:
components/users/[id].vue
```

# NPM práce s verzemi
package.json - dependencies

Např. "vee-validate": "^4.15.1"

Jak mohou být uvedené verze (rozsahy verzí):
- "^4.15.1" Rozsah verzí: 4.x.x
- "~4.15.1" Rozsah verzí: 4.15.x
- "4.15.1"  Konkrétní verze: 4.15.1

### Sémantické verzování:

MAJOR.MINOR.PATCH

## Zjištění verzí
### Nainstalovaných
```
npm list
npm list zod
```

### Registry info
```
npm view zod version    (Nejnovější verze)
npm view zod versions   (Všechny verze)

Závislosti:
npm view @vee-validate/zod dependencies
npm view @vee-validate/zod peerdependencies
```

# Zjišťování typů
```
if (val instanceof Date) {}     //instanceof: Date, Timestamp, ...
if (typeof val==='string') {}   //typeof: string, number, boolean, ... 
```

# Deklarace props v typescript
## Type-based declaration, doporučovaný přístup pro composition API.
```
defineProps<{
  doc: BookApiType,
  PAGE_NAME: string,
}>();
// string s malým: s
```

## Runtime declaration, primárně pro Options API. Není pro náš případ doporučeno.
```
defineProps({
  doc: {
    type: Object as () => BookApiType,
    required: true,
  },
  PAGE_NAME: {
    type: String,
    required: true,
  },
});
// String s velkým: S
```

## Použití authentizace
Následující blok kódu se může použít pouze v soborech umístěných v adresářích/poadresářích: root/page

Nemůže se použít např. v: root/components
```
  definePageMeta({
    middleware: 'auth' 
  });
```

# Cloud function
## Postup jak založit první cloud function

**Najet do root**
```
firebase init functions

Typescript

Do you want to install dependencies with npm now? (Y/n)
y
```

**Přejít do adresáře**
```
cd functions
```

Doinstalovat (firebase-admin není povinný, podle toho, co vše budu používat)
```
npm install firebase-admin firebase-functions
```

**Napsání kódu - např. custom claim**
```
//functions/src/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(); 

exports.setCustomUserClaims = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
        // ... (logika pro čtení role a nastavení claimu)
        // ...
    });
```

Nebo např.
```
import * as functions from "firebase-functions";

export const helloWorld = functions.https.onRequest((req, res) => {
  res.send({ message: "Ahoj z Firebase!" });
});
```

**Pro případ typescript je nutná kompilace**
```
npm run build
```

**Najet do rootu**
```
cd ..
```

**Deploy**
```
firebase deploy --only functions
```

**První deploy**
```
import * as functions from "firebase-functions";

export const helloWorld = functions.https.onRequest((req, res) => {
  res.send({ message: "Ahoj z Firebase!" });
});
```
https://us-central1-inspired-berm-460713-t6.cloudfunctions.net/helloWorld



**Druhý deploy**
```
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
```
https://helloworld-k2ha6kfpha-uc.a.run.app/



**Proč taková změna?**

Toto je skvělé pozorování\! Změna URL adresy není náhodná; naznačuje, přechod z **první generace** Cloud Functions na **druhou generaci** (2nd Gen), která využívá službu **Cloud Run**.

Jde o modernější a doporučený způsob hostování funkcí.

-----

## 🧐 Vysvětlení Změny URL

Rozdílná struktura URL přímo odráží, jakým způsobem jsou Cloud Functions spravovány a hostovány v rámci Google Cloud Platform:

### 1\. První Deploy (1. Generace Cloud Functions)

  * **URL struktura:** `https://[region]-[project-id].cloudfunctions.net/[function-name]`
  * **Technologie:** Běží přímo na původním prostředí **Google Cloud Functions**.
  * **Charakteristika:** Toto je starší, stabilní verze. Funkce se spouští, když je volána, ale její škálování a rychlost startu (cold start) jsou ve srovnání s 2. generací omezenější.

### 2\. Druhý Deploy (2. Generace Cloud Functions)

  * **URL struktura:** `https://[service-name]-[hash]-[region].a.run.app/`
  * **Technologie:** Běží jako služba **Google Cloud Run**.
  * **Charakteristika:** Toto je **druhá generace** Cloud Functions. Firebase je nyní nasazuje jako služby **Cloud Run**, což má tyto výhody:
      * **Vylepšené škálování:** Rychlejší náběh (nižší cold start) a efektivnější škálování až na nulu (nulová spotřeba, když se nepoužívá).
      * **Delší runtime:** Může běžet déle (až 60 minut).
      * **Standardní URL:** Používá standardní doménu Cloud Run (`.a.run.app`), která je navržena pro hostování kontejnerizovaných služeb.

### 💡 Proč k tomu došlo?

V kódu pro druhý deploy se použila **nová syntaxi** pro Cloud Functions, která je specifická pro druhou generaci (např. importy z `firebase-functions/v2/...` nebo použití `onRequest` namísto `functions.https.onRequest`).

**Příklad kódu, který spustí 2. generaci (Cloud Run):**

```typescript
// Toto vyžaduje 2. generaci a spouští se na Cloud Run
import { onRequest } from "firebase-functions/v2/https"; 

export const helloWorld = onRequest((request, response) => { 
    // ... 
});
```

**Závěr:** Změna URL je **pozitivní** indikátor. Funkce nyní běží na modernější a škálovatelnější infrastruktuře Cloud Run, i když jsou stále spravovány přes rozhraní Firebase Cloud Functions.

## Emulace cloud function před nasazením na server
**V root projektu**
```
firebase emulators:start --only functions

nebo obecně:
firebase emulators:start
```
