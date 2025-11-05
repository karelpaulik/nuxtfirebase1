/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

//-----------------------------------------------------------------
// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript


// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// export const helloWorld = onRequest((request, response) => {
//   console.log("Hello logs!", {structuredData: true});
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

//-----------------------------------------------------------------

// import * as functions from "firebase-functions";

// export const helloWorld = functions.https.onRequest((req, res) => {
//   res.send({ message: "Ahoj z Firebase!" });
// });

//-----------------------------------------------------------------

// // Spustí se, když se změní dokument uživatele ve Firestore
// const functions = require('firebase-functions');
// const admin = require('firebase-admin');

// exports.updateUserRoleClaim = functions.firestore
//     .document('users/{userId}')
//     .onUpdate((change, context) => {
        
//         const newRole = change.after.data().role;
//         const uid = context.params.userId;

//         // Použije Admin SDK k nastavení claimu
//         return admin.auth().setCustomUserClaims(uid, { role: newRole });

//         // nebo:
//         // return admin.auth().setCustomUserClaims(uid, { role: newRole })
//         //     .then(() => {
//         //         console.log(`Nastaven nový claim { role: ${newRole} } pro uživatele ${uid}`);
//         //         return null;
//         //     });
//     });

//-----------------------------------------------------------------

import * as admin from 'firebase-admin';
// 1. Importujeme funkci setRoleClaim ze souboru claims.ts
import { setRoleClaim } from './claims'; 

// 1. Inicializace Admin SDK (Tato část zůstává zde)
admin.initializeApp();

// 2. Exportujeme funkci, aby ji Firebase vidělo a nasadilo.
// Většinou se funkce exportují pomocí aliasu, který je stejný jako původní název.
export { setRoleClaim };