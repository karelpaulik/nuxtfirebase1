// composables/useAuthHandlers.ts
import { ref, type Ref } from 'vue';
import type { User } from 'firebase/auth';
import { useLogin, useLogout, useSignUp, useAuthListener } from './useFireAuth';
import { notify, notifyError } from './useNotify'; 

// 1. GLOBÁLNÍ STAV USER: Tento ref je zdrojem pravdy pro celou aplikaci.
// Listener do něj bude vždy zapisovat, bez ohledu na to, kolikrát se volá useAuthHandlers.
const globalUser = ref<User | null>(null);

// 2. SENTINEL (STRÁŽCE): Zajišťuje, že se useAuthListener spustí jen jednou.
let isAuthListenerActive: boolean = false; 

// Definice typu pro obsah Ref
interface AuthFormDataType {
    email: string;
    password: string;
}

/**
 * Hlavní composable pro práci s Firebase Authentication.
 * user: globální stav (synchronizovaný listenerem)
 * loading, error, formData: lokální stavy (vytváří se při každém volání)
 */
export function useAuthHandlers() {
    // 1. LOKÁLNÍ STAVY (Vytváří se při každém volání useAuthHandlers)
    const loading = ref(false);
    const error = ref<Error | null>(null); 

    // 2. DATA FORMULÁŘE (JEDINÝ REF KONTEJNER)
    const formData: Ref<AuthFormDataType> = ref({
        email: '',
        password: '',
    });

    // 3. LISTENERY - Obaleno do kontroly, volá se jen jednou
    if (!isAuthListenerActive) {
        // TOTO se stane pouze PŘI PRVNÍM SPUŠTĚNÍ useAuthHandlers
        
        const unsubscribe = useAuthListener((newUser) => {
            // Listener nyní zapisuje do GLOBÁLNÍ proměnné, čímž aktualizuje stav v celé aplikaci.
            globalUser.value = newUser;            
            console.log('Auth stav změněn. Aktuální uživatel:', newUser?.email || 'uživatel nepřihlášen');
            // if (newUser) {
            //     notify(`Vítejte, ${newUser.email}!`, 'positive');
            // }
        });
        isAuthListenerActive = true;
    }

    // 4. HANDLERY

    const handleSignUp = async (): Promise<void> => {
        const email = formData.value.email;
        const password = formData.value.password;
        
        // Validace
        if (!email || !password || password.length < 6) {
            notify('E-mail a heslo (min. 6 znaků) jsou povinné.', 'warning');
            return;
        }

        if (loading.value) return;

        loading.value = true;
        error.value = null;

        try {
            await useSignUp(email, password); 
            
            notify('Registrace proběhla úspěšně! Nyní jste přihlášeni.', 'positive');
            formData.value = { email: '', password: '' }; 

        } catch (e) {
            error.value = e as Error;
            notifyError('Nepodařilo se dokončit registraci.', e); 
        } finally {
            loading.value = false;
        }
    };
    
    const handleLogin = async (): Promise<void> => {
        const email = formData.value.email;
        const password = formData.value.password;
        
        if (!email || !password) {
            notify('Vyplňte prosím e-mail i heslo.', 'warning');
            return;
        }

        if (loading.value) return;

        loading.value = true;
        error.value = null;

        try {
            await useLogin(email, password);

            notify('Úspěšné přihlášení!', 'positive');
            formData.value = { email: '', password: '' }; 
            
        } catch (e) {
            error.value = e as Error;
            notifyError('Nepodařilo se přihlásit.', e);
        } finally {
            loading.value = false;
        }
    };

    const handleLogout = async (): Promise<void> => {
        if (loading.value) return;

        loading.value = true;
        error.value = null;

        try {
            await useLogout();
            
            notify('Úspěšné odhlášení.', 'positive');
        } catch (e) {
            error.value = e as Error;
            notifyError('Nepodařilo se odhlásit.', e);
        } finally {
            loading.value = false;
        }
    };

    return {
        formData, 
        loading,
        error,
        user: globalUser, // Vrátíme GLOBÁLNÍ stav uživatele
        authHandlers: {
            handleLogin,
            handleLogout,
            handleSignUp,
        }
    };
}