import { ref, type Ref } from 'vue';
// import { useState } from '#app';
// import type { User } from 'firebase/auth';
import { useLogin, useLogout, useSignUp } from './useFireAuth';
import { notify, notifyError } from './useNotify';
import { useLoggedUser } from './useLoggedUser';

// Definice typu pro obsah Ref
interface AuthFormDataType {
    email: string;
    password: string;
}

/**
 * Hlavní composable pro práci s Firebase Authentication.
 * loggedUser: globální stav (synchronizovaný listenerem)
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

    // 3. ZÍSKÁNÍ SDÍLENÉHO STAVU UŽIVATELE (pro pohodlí, aby ho komponenty měly k dispozici)
    const { loggedUser } = useLoggedUser();


    // 5. HANDLERY

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
        loggedUser, // Vrátíme sdílený stav uživatele
        authHandlers: {
            handleLogin,
            handleLogout,
            handleSignUp,
        }
    };
}