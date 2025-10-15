<template>
  <section class="column border1 relative-position">
    <div v-if="loading" class="loading-overlay"></div>
    <div v-if="loading" class="absolute-center q-pa-md text-center text-primary z-top">
      <q-spinner size="3em" color="primary" />
      <p class="q-mt-sm">Zpracovávám data, prosím čekejte...</p>
    </div>

    <FormToolbar
      :form-id="formId"
      :has-changes="hasChanges"
      @add-doc="$emit('addDoc')"
      @update-doc="$emit('updateDoc')"
      @revert-changes="$emit('revertChanges')"
      @del-doc="$emit('delDoc')"
    />

    <div class="column">
      <div class="form-content-scroll q-pa-md">
        <q-banner v-if="error" inline-actions class="text-white bg-negative q-mb-md">
          <template v-slot:avatar>
            <q-icon name="warning" color="white" />
          </template>
          <p class="q-ma-none">Chyba při zpracování dat: <strong>{{ error.message }}</strong></p>
          <template v-slot:action>
            <q-btn flat color="white" label="Zavřít" @click="$emit('clearError')" />
          </template>
        </q-banner>
        <slot></slot>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import FormToolbar from '~/components/_shared/nav/FormToolbar.vue';

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  formId: {
    type: String,
    default: '',
  },
  hasChanges: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Object as () => Error | null,
    default: null
  }
});

defineEmits(['addDoc', 'updateDoc', 'revertChanges', 'delDoc', 'clearError']);
</script>

<style scoped>
.form-content-scroll {
  overflow-y: auto;
  max-height: calc(100vh - 400px);

  -ms-overflow-style: none;
  scrollbar-width: none;
}

.form-content-scroll::-webkit-scrollbar {
  display: none;
}

.border1 {
  border: 5px solid gray;
  border-radius: 5px;
}
</style>
