// middleware/auth.ts

// Důležité: Importujeme composable, které nám dává přístup ke globálnímu stavu 'user'.
import { useAuthHandlers } from '~/composables/useAuthHandlers';
import { notify, notifyError } from '~/composables/useNotify'; 

export default defineNuxtRouteMiddleware((to, from) => {
    // 1. Získáme globální stav uživatele
    // Destrukturalizujeme user: globalUser, který vrací useAuthHandlers
    const { user } = useAuthHandlers(); 

    // 2. Kontrola stavu
    if (!user.value) { // Uživatel NENÍ přihlášen!       
        // Zastavíme navigaci na aktuální chráněnou stránku
        // A přesměrujeme uživatele na stránku pro přihlášení (např. /auth)
        console.log(`Middleware: Přístup na routu ${to.path} odepřen, přesměrování na /auth.`);
        notifyError(`Middleware: Přístup na routu ${to.path} odepřen, přesměrování na /auth.`); 
        
        // Můžeme vrátit přesměrování s kódem 302 (Found)
        return navigateTo('/auth', { redirectCode: 302 });
    }
    
    // Jestliže uživatel přihlášen, povolíme přístup na stránku
});