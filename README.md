# Nasazení na static hosting google.

```
npm run build
Vytvoří se .output/public

Do tohoto adresáře najet a provést deploy na google hosting.
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