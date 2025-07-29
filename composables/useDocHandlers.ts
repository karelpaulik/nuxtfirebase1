import { ref, reactive, watch, type Ref } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave, type Router, type RouteLocationNormalizedLoaded } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import type { ZodObject, ZodRawShape } from 'zod';

// Předpokládáme, že tyto importy jsou správně nastaveny ve vašem projektu
import { useReadDoc, useAddColl, useUpdateDoc, useDelDoc } from '~/composables/useFirestore';
// import { normalizeData } from '~/utils/normalizeData'; // Tato funkce se již nepoužívá, můžete ji odstranit
import { userApiSchema } from '@/schemas/userSchema';
import type { UserForApi as User } from '@/schemas/userSchema';
import { notifyError, notify, displayVeeValidateErrors, displayZodErrors } from './useNotify';

/**
 * Interface pro props, které handlery potřebují.
 * Nyní předává celou instanci VeeValidate formuláře pro plnou kontrolu.
 */
export interface FormHandlerProps<T extends Record<string, any>> {
  initialDocumentIdRef: Ref<string | undefined>;
  formId: Ref<string | null>;
  hasChanges: Ref<boolean>;
  collectionName: string;
  pageName: string;
  createEmptyData: () => T;
  router: Router; // Použijte typ Router
  route: RouteLocationNormalizedLoaded; // Použijte typ RouteLocationNormalizedLoaded
  formVee: ReturnType<typeof useForm<T>>; // Předáváme celou instanci VeeValidate formuláře
}

// --- Samostatné a individuálně exportované funkce pro handlery ---

// setHasChanges je redundantní, protože hasChanges je sledováno přes meta.dirty z VeeValidate.
// Doporučuji tuto funkci odstranit a její volání.
// export const setHasChanges = (props: FormHandlerProps<any>): void => {
//   props.hasChanges.value = true;
// };

export const handleReadDoc = async <T extends Record<string, any>>(props: FormHandlerProps<T>, idToRead: string): Promise<void> => {
  const { formId, hasChanges, collectionName, pageName, router, formVee } = props; // Destrukturalizujeme formVee

  try {
    const doc = await useReadDoc(collectionName, idToRead);
    if (doc) {
      const validData = userApiSchema.safeParse(doc.data);
      if (validData.success) {
        console.log('Data úspěšně validována:', validData.data);
        // Nastavíme hodnoty do VeeValidate formuláře a resetujeme jej
        formVee.resetForm({ values: validData.data as T }); // Tímto se nastaví nové hodnoty jako 'čisté' a meta.dirty/touched se resetuje na false
        formId.value = doc.id;
        //hasChanges.value = false; // Automaticky se nastaví přes watch na formVee.meta.dirty
        notify('Dokument úspěšně načten!', 'positive');
      } else {
        // validData.error.issues.forEach(issue => {
        //   console.error(`Chyba na cestě: ${issue.path.join('.')}, Zpráva: ${issue.message}`);
        //   notify(`Chyba na cestě: ${issue.path.join('.')}, Zpráva: ${issue.message}`, 'negative', 'top', 5000);
        // });
        displayZodErrors(validData.error);
        notifyError('Chyba validace dat z databáze.', validData.error);
        await router.push(`/${pageName}/new`);
      }
    } else {
      console.log(`Dokument s ID '${idToRead}' nebyl nalezen v kolekci '${collectionName}'.`);
      notify(`Záznam s ID '${idToRead}' nebyl nalezen. Budete přesměrováni na vytvoření nového záznamu.`, 'negative', undefined, 5000);
      await router.push(`/${pageName}/new`);
    }
  } catch (e) {
    notifyError('Chyba při čtení dokumentu:', e);
    await router.push(`/${pageName}/new`);
  }
};

export const handleRevertChanges = async <T extends Record<string, any>>(props: FormHandlerProps<T>): Promise<void> => {
  const { formId, hasChanges, createEmptyData, formVee } = props; // Destrukturalizujeme formVee

  if (!formId.value) {
    console.warn('Nelze vrátit změny: Není načten žádný dokument ani nový formulář.');
    notify('Nelze vrátit změny: Není načten žádný dokument ani nový formulář.', 'warning');
    return;
  }
  if (confirm('Opravdu chcete vrátit všechny neuložené změny?')) {
    if (formId.value === 'new') {
      formVee.resetForm({ values: createEmptyData() }); // Reset VeeValidate form s prázdnými daty
      // hasChanges.value = false; // Automaticky se nastaví přes watch na formVee.meta.dirty
      notify('Formulář pro nový záznam byl resetován!', 'positive');
      console.log('Formulář pro nový záznam byl resetován.');
    } else {
      await handleReadDoc(props, formId.value); // Znovu načte dokument a resetuje formulář
      // hasChanges.value = false; // Automaticky se nastaví přes watch na formVee.meta.dirty
      notify('Změny byly vráceny!', 'positive');
      console.log('Změny byly vráceny opětovným načtením dokumentu.');
    }
  }
};

export const handleAddDoc = async <T extends Record<string, any>>(props: FormHandlerProps<T>): Promise<void> => {
  const { hasChanges, collectionName, pageName, router, formVee } = props; // Destrukturalizujeme formVee

  // Spustíme validaci formuláře
  const { valid, errors, values } = await formVee.validate();
  if (!valid) {
    displayVeeValidateErrors(errors);
    //notifyError('Formulář obsahuje chyby. Opravte je před uložením.', errors);
    console.error('Validation errors:', errors);
    return;
  }

  if (!confirm(`Opravdu chcete vytvořit nový dokument v kolekci '${collectionName}'?`)) {
    console.log('Nevytvářím');
    return;
  }
  try {
    const docId = await useAddColl(collectionName, values as User); // Použijeme validované hodnoty
    if (docId) {
      // hasChanges.value = false; // Automaticky se nastaví přes watch na formVee.meta.dirty
      formVee.resetForm(); // Reset VeeValidate form po uložení (resetuje na initialValues)
      await router.push(`/${pageName}/${docId}`);
      notify('Dokument úspěšně vytvořen!', 'positive');
      console.log(`Vytvořen dokument s ID: ${docId} v kolekci ${collectionName}`);
    }
  } catch (e) {
    notifyError('Chyba při ukládání z komponenty:', e);
  }
};

export const handleUpdateDoc = async <T extends Record<string, any>>(props: FormHandlerProps<T>): Promise<void> => {
  const { formId, hasChanges, collectionName, formVee } = props; // Destrukturalizujeme formVee

  // Spustíme validaci formuláře
  const { valid, errors, values } = await formVee.validate();
  if (!valid) {
    displayVeeValidateErrors(errors);
    //notifyError('Formulář obsahuje chyby. Opravte je před uložením.', errors);
    console.error('Validation errors:', errors);
    return;
  }

  if (!formId.value || formId.value === 'new') {
    console.warn('Nelze aktualizovat: Žádné platné ID dokumentu k úpravě.');
    notify('Nelze aktualizovat: Žádné platné ID dokumentu k úpravě.', 'warning');
    return;
  }
  if (!confirm(`Opravdu chcete updatovat data s ID: ${formId.value} v kolekci '${collectionName}'?`)) {
    console.log('Neupravuji');
    return;
  }
  try {
    const success = await useUpdateDoc(collectionName, formId.value, values as User); // Použijeme validované hodnoty
    if (success) {
      console.log(`Dokument s ID '${formId.value}' v kolekci '${collectionName}' byl úspěšně aktualizován!`);
      // hasChanges.value = false; // Automaticky se nastaví přes watch na formVee.meta.dirty
      formVee.resetForm({ values: values as T }); // Reset VeeValidate form po uložení, ale zachovat aktuální hodnoty jako nové 'čisté'
      notify('Dokument úspěšně aktualizován!', 'positive');
    } else {
      console.log('Dokument nebyl aktualizován (neznámý důvod).');
      notify('Dokument nebyl aktualizován.', 'info');
    }
  } catch (e) {
    notifyError('Došlo k chybě při aktualizaci dokumentu:', e);
  }
};

export const handleDelDoc = async <T extends Record<string, any>>(props: FormHandlerProps<T>): Promise<void> => {
  const { formId, hasChanges, collectionName, pageName, createEmptyData, router, formVee } = props; // Destrukturalizujeme formVee

  if (!formId.value || formId.value === 'new') {
    console.warn('Žádné platné ID dokumentu k smazání.');
    notify('Žádné platné ID dokumentu k smazání.', 'warning');
    return;
  }
  if (!confirm(`Opravdu chcete smazat data s ID: ${formId.value} z kolekce '${collectionName}'?`)) {
    console.log('Nemažu');
    return;
  }
  try {
    const success = await useDelDoc(collectionName, formId.value);
    if (success) {
      console.log(`Dokument s ID '${formId.value}' z kolekce '${collectionName}' byl úspěšně smazán!`);
      formVee.resetForm({ values: createEmptyData() }); // Reset VeeValidate form s prázdnými daty
      formId.value = 'new';
      // hasChanges.value = false; // Automaticky se nastaví přes watch na formVee.meta.dirty
      await router.push(`/${pageName}`);
      notify('Dokument úspěšně smazán!', 'positive');
    } else {
      console.log('Dokument nebyl smazán (neznámý důvod).');
      notify('Dokument nebyl smazán.', 'info');
    }
  } catch (e) {
    notifyError('Došlo k chybě při mazání dokumentu:', e);
  }
};

// --- Samostatná exportovaná funkce pro watch logiku ---
export function useWatchRouteId<T extends Record<string, any>>(props: FormHandlerProps<T>): void {
  const { route } = props;

  watch(() => route.params.id, async (newIdParam) => {
    const id = newIdParam as string;
    const { formId, hasChanges, pageName, createEmptyData, formVee } = props; // Destrukturalizujeme formVee

    if (id === 'new') {
      console.log(`Routa je /${pageName}/new, inicializuji formulář pro nový záznam.`);
      formId.value = 'new';
      formVee.resetForm({ values: createEmptyData() }); // Reset VeeValidate form s prázdnými daty
      // hasChanges.value = false; // Automaticky se nastaví přes watch na formVee.meta.dirty
    } else if (id) {
      console.log(`ID v URL se změnilo na '${id}', načítám záznam.`);
      formId.value = id;
      await handleReadDoc(props, id);
    } else {
      console.warn('Neočekávaný stav: ID v URL chybí.');
      formId.value = null;
      formVee.resetForm({ values: createEmptyData() }); // Reset VeeValidate form s prázdnými daty
      // hasChanges.value = false; // Automaticky se nastaví přes watch na formVee.meta.dirty
    }
  }, { immediate: true });
}

export function useWatchDocumentId<T extends Record<string, any>>(props: FormHandlerProps<T>): void {
  watch(() => props.initialDocumentIdRef.value, async (newIdParam) => {
    const id = newIdParam as string;

    const { formId, hasChanges, pageName, createEmptyData, formVee } = props; // Destrukturalizujeme formVee

    if (id === 'new') {
      console.log(`Document ID prop je 'new', inicializuji formulář pro nový záznam.`);
      formId.value = 'new';
      formVee.resetForm({ values: createEmptyData() }); // Reset VeeValidate form s prázdnými daty
      // hasChanges.value = false; // Automaticky se nastaví přes watch na formVee.meta.dirty
    } else if (id) {
      console.log(`Document ID prop se změnilo na '${id}', načítám záznam.`);
      formId.value = id;
      await handleReadDoc(props, id);
    } else {
      console.warn('Neočekávaný stav: Document ID prop chybí nebo je neplatné.');
      formId.value = null;
      formVee.resetForm({ values: createEmptyData() }); // Reset VeeValidate form s prázdnými daty
      // hasChanges.value = false; // Automaticky se nastaví přes watch na formVee.meta.dirty
    }
  }, { immediate: true });
}

// --- Samostatná exportovaná funkce pro onBeforeRouteLeave logiku
export function useConfirmRouteLeave<T extends Record<string, any>>(props: FormHandlerProps<T>): void {
  const { hasChanges } = props;

  onBeforeRouteLeave((to, from, next) => {
    if (hasChanges.value) {
      const confirmLeave = confirm(
        'Máte neuložené změny. Opravdu chcete odejít bez uložení?'
      );
      if (confirmLeave) {
        hasChanges.value = false;
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  });
}

// Hlavní Composables funkce.
export function useDocHandlers<T extends Record<string, any>>(
  initialDocumentIdProp: Ref<string | undefined>,
  collectionName: string,
  pageName: string,
  createEmptyData: () => T,
  validationSchema: ZodObject<ZodRawShape>
) {
  const formId = ref<string | null>(null);
  const hasChanges = ref<boolean>(false);

  const router = useRouter();
  const route = useRoute();

  // Inicializace VeeValidate formuláře
  const formVee = useForm<T>({
    validationSchema: toTypedSchema(validationSchema),
    initialValues: createEmptyData(),
  });

  const { defineField } = formVee; // Získání defineField z instance formuláře

  // Vytvoříme reaktivní objekt, který bude obsahovat všechny fieldy jako Refs
  const formData = reactive<T>({} as T);
  const fieldNames: Array<keyof T> = Object.keys(createEmptyData()) as Array<keyof T>;

  fieldNames.forEach(fieldName => {
    const [fieldRef] = defineField(fieldName as string);
    formData[fieldName] = fieldRef as any;
  });

  // Sledujeme změny ve formuláři (z VeeValidate) a aktualizujeme hasChanges
  watch(() => formVee.meta.value.dirty, (newDirty) => {
    hasChanges.value = newDirty;
  }, { deep: true });

  const handlerProps: FormHandlerProps<T> = {
    initialDocumentIdRef: initialDocumentIdProp,
    formId,
    hasChanges,
    collectionName,
    pageName,
    createEmptyData,
    router,
    route,
    formVee, // <-- Předáváme celou instanci formVee
  };

  return {
    formId,
    formData, // Vracíme náš speciální 'formData' objekt s Refy
    hasChanges,
    _handlerProps: handlerProps,
    formVee, // <-- Vracíme celou instanci VeeValidate formuláře pro přístup z komponenty (např. pro debug)
  };
}