<template>
  <div class="q-pa-md row items-center justify-center q-gutter-md">
    <div v-if="loading">Načítám...</div>
    
    <div v-if="error" class="text-negative">
      Chyba: {{ error.message }}
      <button @click="error = null">Zavřít</button>
    </div>

    <div v-if="user">
      <h3>Uživatel je přihlášen jako:</h3>
      <p>E-mail: **{{ user.email }}**</p>
      <button @click="handleLogout" :disabled="loading">
        Odhlásit se
      </button>
    </div>

    <div v-else>
      <h3>Přihlášení / Registrace</h3>
      
      <div class="q-gutter-y-md column">
        <div>
          <label for="email">E-mail</label>
          <input
            id="email"
            type="email"
            v-model="formData.email"
            :disabled="loading"
            placeholder="Zadejte e-mail"
          />
        </div>

        <div>
          <label for="password">Heslo</label>
          <input
            id="password"
            type="password"
            v-model="formData.password"
            :disabled="loading"
            placeholder="Zadejte heslo"
          />
        </div>

        <div class="q-gutter-x-md">
          <button @click="handleLogin" :disabled="loading || !formData.email || !formData.password">
            Přihlásit
          </button>
          
          <button @click="handleSignUp" :disabled="loading || !formData.email || formData.password.length < 6">
            Registrovat
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthHandlers } from '~/composables/useAuthHandlers';

// Destrukturalizace potřebných hodnot z composable
const {
  formData,
  loading,
  error,
  user,
  authHandlers: {
    handleLogin,
    handleLogout,
    handleSignUp,
  }
} = useAuthHandlers();

// Zde by mohl být přidaný kód pro navigaci po přihlášení/odhlášení
// například pomocí watch(() => user.value, (newUser) => { ... })
</script>

<style scoped>
/* Zjednodušené styly pro názornost */
.text-negative {
    color: red;
    border: 1px solid red;
    padding: 10px;
    margin-bottom: 10px;
}

input {
    display: block;
    margin-top: 5px;
    padding: 8px;
    border: 1px solid #ccc;
}
</style>