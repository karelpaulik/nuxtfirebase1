import { doc, getDoc, collection, addDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore'
//const { $firestore } = useNuxtApp() //nelze volat na úrovní  modulu kvůli server side rendering

export const usePostColl = async(coll: string, body: object) => {
  const { $firestore } = useNuxtApp()
  try {
    const usersCollection = collection($firestore, coll);
    const docRef = await addDoc(usersCollection, body);
    console.log(docRef.id);
    return docRef.id;
  } catch (e) {
      console.error("Chyba při přidávání dokumentu:", e);
      throw e;
  }
}

export const useGetDoc = async(coll: string, idDoc: string) => {
  try {
    const { $firestore } = useNuxtApp()
    const docRef = doc($firestore, coll, idDoc)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data())
        return docSnap.data()
    } else {
        console.log("No such document!")
        return null
    }
  } catch (e) {
      console.error("Chyba při čtení dokumentu:", e);
      throw e;
  }    
}

export const useDelDoc = async(coll: string, idDoc: string) => {  //nekontroluje, jestli dokument existuje nebo ne.
  try {
    const { $firestore } = useNuxtApp()
    const docRef = doc($firestore, coll, idDoc)
    await deleteDoc(docRef)
    console.log(`Dokument s ID: ${idDoc} byl úspěšně smazán.`);
    return true // Indikuje úspěšné smazání
  } catch (e) {
    console.error(`Chyba při mazání dokumentu s ID: ${idDoc}:`, e);
    throw e;
  }
}
