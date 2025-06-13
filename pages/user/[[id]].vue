<template>
  <section>
    <div>Práce s firestore za použítí pluginu.</div>
    <div v-if="userData">
      fName<input v-model="userData.fName" placeholder="fName">
      lName<input v-model="userData.lName" placeholder="lName">
      born<input v-model="userData.born" placeholder="Born">
    </div>
    <button @click="handleAddUser">Vytvořit dokument</button>
    <button @click="handleUpdateUser">Upravit dokument</button>
    <button @click="handleDelUser">Smaž dokument</button>
    <pre>{{userData}}</pre>
    <p v-if="userId">Aktuální ID dokumentu: {{ userId }}</p>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'

const createEmptyUserData = () => {
  return {
    fName: '',
    lName: '',
    born: ''
  };
};

const route = useRoute();
const userId=ref(null);
const userData = ref(createEmptyUserData());

watch(() => route.params.id, (newId) => {
  if (newId) {
    console.log('ID v URL se změnilo, načítám uživatele:', newId);
    userId.value=newId;
    handleReadUser(newId);
  } else {  // Pokud je ID v URL undefined (např. jsme na /user bez parametru)
    console.log('ID v URL není přítomno, resetuji formulář.');
	  userData.value = createEmptyUserData();
    userId.value = null;
  }
}, { immediate: true }); // immediate: true zajistí spuštění hned po naložení komponenty

async function handleReadUser(idToRead) {
  try {
    const doc = await useReadDoc('users', idToRead);
    if (doc) {
      userData.value=doc.data; //console.log("handleReadUser:", doc.data);
	  userId.value = doc.id;
    } else {
    // --- KLÍČOVÁ ZMĚNA ZDE: Explicitní reset, pokud dokument nebyl nalezen ---
    console.log(`Dokument s ID '${idToRead}' nebyl nalezen.`);
    userData.value = createEmptyUserData();
    userId.value = null;
    }
  } catch (e) {
    console.error("Chyba při čtení dokumentu:", e);
	  userData.value = createEmptyUserData();
    userId.value = null;
  }
}

async function handleAddUser() {
  try {
    const docId = await useAddColl('users', userData.value);
    if (docId) {
      await navigateTo('/user/' + docId)
      console.log(`Vytvořen dokument s ID: ${docId}`);
    }
  } catch (e) {
    console.error("Chyba při ukládání z komponenty:", e);
  }
}

async function handleUpdateUser() {
  if (!userId.value) {
    console.warn('Nelze aktualizovat: Žádné ID dokumentu k úpravě. Vytvořte nový nebo načtěte existující.');
    return;
  }
  try {
    const success = await useUpdateDoc('users', userId.value, userData.value);
    if (success) {
      console.log(`Dokument s ID '${userId.value}' byl úspěšně aktualizován!`);
      //handleReadUser(userId.value)  Není třeba, formulář je aktuální.
    } else {
      console.log('Dokument nebyl aktualizován (neznámý důvod).');
    }
  } catch (e) {
    console.error('Došlo k chybě při aktualizaci dokumentu:', e);
  }
}

async function handleDelUser() {
  if (!userId.value) { // Zkontrolujeme, zda vůbec nějaké ID máme
    console.warn('Žádné ID dokumentu k smazání.');
    return; // Pokud ID chybí, nic neděláme
  }
  try {
    const success = await useDelDoc('users', userId.value); // Použijeme aktuální userId.value
    if (success) {
      console.log(`Dokument s ID '${userId.value}' byl úspěšně smazán!`);
      // Po smazání je důležité resetovat stav formuláře
      userData.value = createEmptyUserData();
      userId.value = null;
    } else {
        console.log('Dokument nebyl smazán (neznámý důvod).');
    }
  } catch (e) {
    console.error('Došlo k chybě při mazání dokumentu:', e);
  }
}

</script>
