<template>
  <section>
    <div>Práce s firestore za použítí pluginu.</div>
    <div v-if="userData">
      fName<input v-model="userData.fName" placeholder="fName">
      lName<input v-model="userData.lName" placeholder="lName">
      born<input v-model="userData.born" placeholder="Born">
    </div>
    <button @click="handleReadUser">Načíst dokument composables</button>
    <button @click="handleAddUser">Uložit dokument composables</button>
    <button @click="handleDelUser">Smaž dokument composables</button>
    <pre>{{userData}}</pre>
  </section>
</template>

<script setup>
//git změna
import { ref } from 'vue'

// const route = useRoute();
// const userId=ref(null);

const userData = ref({
  fName: '',
  lName: '',
  born: ''
});

// if (route.params.id) {   
//   console.log(route.params.id);
//   userId.value=route.params.id;
//   handleReadUser();
// }

async function handleAddUser() {
  try {
    const docId = await usePostColl('users', userData.value);
    if (docId) {
      console.log(`Dokument uložen s ID: ${docId}`);
    }
  } catch (e) {
    console.error("Chyba při ukládání z komponenty:", e);
  }
}

async function handleReadUser() {
  try {
    const doc = await useGetDoc('users', '1hv7MLFAgbXxW99z6kLv');
    if (doc) {
      userData.value=doc
      console.log(`Dokument uložen s ID: ${doc}`);
    }
  } catch (e) {
    console.error("Chyba při čtení dokumentu:", e);
  }
}

async function handleDelUser() {
  try {
    const success = await useDelDoc('users', 'woff0Uk6yPkJ9oNKKX0e');
    if (success) {
      console.log('Dokument byl úspěšně smazán!');
    } else {
      console.log('Dokument nebyl smazán (neznámý důvod).');
    }
  } catch (e) {
    console.error('Došlo k chybě při mazání dokumentu:', e);
  }
}

</script>
