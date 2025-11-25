import * as admin from 'firebase-admin';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2'; 

/**
 * setRoleClaim
 * * Spustí se pokaždé, když se v kolekci 'userRoles' změní dokument.
 * Přečte pole 'roles' a boolean 'isManager' a nastaví je jako Custom Claims v Firebase Auth.
 */
export const setRoleClaim = onDocumentWritten({ //onDocumentWritten se spouští při změně dokumentu, nebo při vytvoření nového dokumentu.
    document: 'userRoles/{userId}', 
    database: 'firestore-in-fb-pa1'
}, async (event) => {
    
    // 1. Získání dat
    const uid = event.params.userId;

    const beforeData = event.data?.before.data() || null;
    const afterData = event.data?.after.data() || null;

    if (!afterData) {
        logger.info(`After data missing for user ${uid}. Skipping.`);
        return null;
    }

    const beforeRoles: string[] = beforeData?.roles || [];
    const afterRoles: string[] = afterData.roles || [];

    const beforeIsManager: boolean = !!beforeData?.isManager;
    const afterIsManager: boolean = !!afterData.isManager;

    // 1. kontrola, zda došlo ke změně atributů vstupujících do custom claims ---------------------------
    const rolesUnchanged = JSON.stringify(beforeRoles) === JSON.stringify(afterRoles);
    const isManagerUnchanged = beforeIsManager === afterIsManager;
    
    if (rolesUnchanged && isManagerUnchanged) {
        logger.info(`Roles and isManager fields unchanged for user ${uid}. Skipping.`);
        return null;
    }
    // Konec 1. kontroly----------------------------------------------------------------------------------

    // Získání nového pole rolí. newRoles bude nyní bezpečné pole (string[]).
    // Ponecháno pole 'def' pro případ, že pole 'roles' je prázdné/neexistuje.
    const newRoles: string[] = afterRoles.length > 0 ? afterRoles : ['def']; 
    
    // Nový status isManager
    const newIsManager: boolean = afterIsManager;

    try {
        // Kontrola aktuálního claimu pro minimalizaci zápisů
        const user = await admin.auth().getUser(uid);
        const currentClaims = user.customClaims || {};

        // 2. kontrola, zda se aktuální claimy shodují s novými-----------------------------------------------
        const currentClaimsJson = JSON.stringify({
            roles: currentClaims.roles || [],
            isManager: !!currentClaims.isManager
        });
        const newClaimsJson = JSON.stringify({
            roles: newRoles,
            isManager: newIsManager
        });

        if (currentClaimsJson === newClaimsJson) {
            logger.info(`Claims (roles, isManager) already set correctly for user ${uid}. No server update needed.`);
            return null;
        }
        // Konec 2. kontroly----------------------------------------------------------------------------------

        // 3. Nastavení Custom Claim pomocí Admin SDK
        await admin.auth().setCustomUserClaims(uid, { 
            roles: newRoles,
            isManager: newIsManager
        });
        
        // Vynutí klientovi obnovit token
        await admin.auth().revokeRefreshTokens(uid);
        
        logger.info(`SUCCESS: Custom Claims set (roles: ${newClaimsJson}) for UID: ${uid}. Tokens revoked.`);
        
        return null;
    } catch (error) {
        
        // --- Ošetření chyb: Řešení TS18046 a auth/user-not-found ---
        const isFirebaseAuthError = 
            error !== null && 
            typeof error === 'object' && 
            'code' in error;

        // Ošetření případu, kdy uživatel v Auth byl smazán
        if (isFirebaseAuthError && error.code === 'auth/user-not-found') {
            logger.warn(`User ${uid} not found in Firebase Auth. Document update was ignored.`);
            return null; 
        }
        
        // Ostatní neočekávané chyby
        logger.error(`UNEXPECTED ERROR setting Custom Claim for user ${uid}:`, error);
        return null;
    }
});