# Nasazení na static hosting google.

```
npm run build
Vytvoří se .output/public

Do tohoto adresáře najet
cd .output/public

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