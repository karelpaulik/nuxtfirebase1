// functions/src/auth.ts - OPRAVENÁ VERZE S getFirestore

import * as functions from 'firebase-functions/v1'; 
import { UserRecord } from 'firebase-admin/auth'; 
import { getFirestore, FieldValue } from 'firebase-admin/firestore'; 

/**
 * ID vaší pojmenované databáze.
 */
const DATABASE_ID = 'firestore-in-fb-pa1';

/**
 * createInitialUserRole
 */
export const createInitialUserRole = functions.auth.user().onCreate(async (user: UserRecord) => {
    
    // ZMĚNA: Používáme getFirestore s explicitním ID databáze
    const db = getFirestore(DATABASE_ID); 
    // Poznámka: První argument je 'app', 'undefined' odkazuje na výchozí App.

    const uid = user.uid;
    const email = user.email || 'N/A';

    console.info(`Spouštím vytvoření výchozí role (V1) pro nového uživatele: ${uid} (${email}). Připojuji se k DB: ${DATABASE_ID}`);

    // Definice dat pro uložení
    const initialRoleData = {
        email: email,
        roles: ['def'], 
        isManager: false,
        createdAt: FieldValue.serverTimestamp()
    };

    // Vytvoření dokumentu
    try {
        await db.collection('userRoles').doc(uid).set(initialRoleData);
        
        console.info(`SUCCESS: Výchozí role vytvořena v 'userRoles' pro UID: ${uid}.`);
        
        return null;

    } catch (error) {
        console.error(`FATAL ERROR: Chyba při vytváření výchozí role v 'userRoles' pro UID: ${uid}`, error);
        return null;
    }
});