<template>
  <div>
    <h4 class="q-pa-xs q-ma-xs">{{ formId === 'new' ? 'Nový záznam' : 'Detail záznamu' }}</h4>

    <div class="q-pa-md" style="max-width: 300px">
      <q-input v-model="formData.title" label="title" />
      <q-input v-model="formData.author" label="Author" />
      <DateInput v-model="formData.createdDate" label="createdDate" />

      <InputSelect
        v-model="formData.currUserRefUsers"
        label="Vyberte uživatele"
        collection-name="users"
        :attributes="userSelectAttributes"
        :option-value-fn="opt => opt.id"
        :option-label-fn="opt => `${opt.fName} ${opt.lName} ${opt.born}`"
      />
      <!-- 
      :attributes  Které atributy se uloží do db v rererenci.
      :option-value-fn  Ponechat téměř vždy "opt.id". I bez "emit-value" a "map-option" je vhodné ponechat. V "multiple" téměř nutné, v "single" není nezbytné - ale stále vhodné (porovnání záznamů).
      :option-label-fn  Které atributy se zobrazí po vybrání v q-select (podmnožina :attribute)
      -->
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BookFormType } from '@/schemas/bookSchema';
import { userSelectAttributes } from '@/schemas/userSchema';
import DateInput from '~/components/_shared/ui/form/DateInput.vue';
import InputSelect from '~/components/_shared/ui/form/InputSelect.vue';

defineProps<{
  formId: string;
}>();

const formData = defineModel<BookFormType>();

const emit = defineEmits<{
  (e: 'save-request'): void;
}>();
</script>
