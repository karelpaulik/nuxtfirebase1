// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  ssr: false,
  // TOTO JE KLÍČOVÉ PRO EXPORT ČISTĚ STATICKÝCH SOUBORŮ VČETNĚ index.html
  //Generování stat. souborů:
  //npm run build (protože ssr: false), nyní tedy ne "npm run generate"
  nitro: {
    output: {
      publicDir: '.output/public' // Standardní výstupní adresář pro statické soubory
    },
    preset: 'static' // Tímto říkáte Nitru, aby generovalo čistě statické soubory
  }
})
