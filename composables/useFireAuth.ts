// composables/useFireAuth.ts
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';

// 2. Import typů pomocí 'import type'
import type { 
    User, // Typ pro uživatele
    Auth, // Typ pro Auth instanci
} from 'firebase/auth';

import { notify, notifyError, confirmDialog } from './useNotify'; // Předpoklad notifikační funkce

/**
 * Získá Firebase Auth instanci z Nuxt App.
 * @returns {Auth} Firebase Auth instance.
 * @throws {Error} Pokud $fireAuth není dostupný.
 */
const getAuthInstance = (): Auth => {
    const { $fireAuth } = useNuxtApp();
    if (!$fireAuth) {
        throw new Error('Firebase Auth instance ($fireAuth) není dostupná. Zkontrolujte plugins/firebase.client.ts.');
    }
    return $fireAuth;
};

/**
 * Zaregistruje nového uživatele pomocí e-mailu a hesla.
 * @param {string} email E-mail uživatele.
 * @param {string} password Heslo uživatele.
 * @returns {Promise<User | null>} Uživatelský objekt, nebo null v případě neúspěchu.
 */
export const useSignUp = async (email: string, password: string): Promise<User | null> => {
    try {
        const auth = getAuthInstance();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log(`Uživatel ${email} úspěšně zaregistrován.`);
        
        await signOut(auth); // Nově vytvořeného a přihlášeného uživatele odhlásíme. Až při dalším přihlášení se natáhne custom claims.

        const ok = await confirmDialog(
            'Registrace úspěšná',
            `Účet <b>${email}</b> byl úspěšně vytvořen. Nyní se můžete přihlásit.`,
            'Přihlásit se',
            'Zavřít',
            'positive'
        );

        if (ok) {
            console.log('Uživatel potvrdil.');
            //navigateTo('/auth');
        }        
        return userCredential.user; //S vrácenou hodnotozu se napracuje: await useSignUp(email, password);

    } catch (e: any) {
        notifyError(`Chyba při registraci uživatele: ${email}`, e);
        throw e;
    }
};

/**
 * Přihlásí uživatele pomocí e-mailu a hesla.
 * @param {string} email E-mail uživatele.
 * @param {string} password Heslo uživatele.
 * @returns {Promise<User | null>} Uživatelský objekt, nebo null v případě neúspěchu.
 */
export const useLogin = async (email: string, password: string): Promise<User | null> => {
    try {
        const auth = getAuthInstance();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log(`Uživatel ${email} úspěšně přihlášen.`);

        // // Nově pro claims ----------------------------------------------
        // const user = userCredential.user;
      
        // //const tokenResult = await auth.currentUser.getIdTokenResult(true);
        // const tokenResult = await user.getIdTokenResult(true); // Toto je vhodnější, i když to v podstětě dělá to samé jako řádek výše.

        // const claims = tokenResult.claims;
        // const roles = tokenResult.claims.roles; // Bude to pole: např. ["admin", "editor"]
        
        // console.log('Uživatel přihlášen. Claims: ', claims);
        // console.log('Uživatel přihlášen. Role pole: ', roles);
        // // ---------------------------------------------------------------

        return userCredential.user; //S vrácenou hodnotozu se napracuje: await useLogin(email, password);

    } catch (e: any) {
        notifyError(`Chyba při přihlášení uživatele: ${email}`, e);
        throw e;
    }
};

/**
 * Odhlásí aktuálně přihlášeného uživatele.
 * @returns {Promise<void>}
 */
export const useLogout = async (): Promise<void> => {
    try {
        const auth = getAuthInstance();
        await signOut(auth);
        console.log('Uživatel úspěšně odhlášen.');
    } catch (e: any) {
        notifyError('Chyba při odhlášení.', e);
        throw e;
    }
};
