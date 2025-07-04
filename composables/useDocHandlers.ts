import { ref, watch, type Ref } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave, type Router, type RouteLocationNormalizedLoaded } from 'vue-router'; // Přidáno typování pro Router a RouteLocationNormalizedLoaded

// Předpokládáme, že tyto importy jsou správně nastaveny ve vašem projektu
import { useReadDoc, useAddColl, useUpdateDoc, useDelDoc } from '~/composables/useFirestore';
import { normalizeData } from '~/utils/normalizeData'; // Import normalizační funkce

/**
 * Interface pro props, které handlery potřebují.
 * Rozšířeno o instanci routeru a routy.
 * Exportujeme ho, aby byl dostupný i jinde pro typování.
 */
export interface FormHandlerProps<T> {
  formId: Ref<string | null>;
  formData: Ref<T>;
  hasChanges: Ref<boolean>;
  collectionName: string;
  pageName: string;
  createEmptyData: () => T;
  router: Router; // Přidáno: instance routeru
  route: RouteLocationNormalizedLoaded; // Přidáno: instance aktuální routy
}

// --- Samostatné a individuálně exportované funkce pro handlery ---

export const setHasChanges = (props: FormHandlerProps<any>): void => {
  props.hasChanges.value = true;
};

export const handleReadDoc = async <T extends Record<string, any>>(props: FormHandlerProps<T>, idToRead: string): Promise<void> => {
  const { formId, formData, hasChanges, collectionName, pageName, createEmptyData, router } = props; // Destrukturalizujeme router z props

  try {
    const doc = await useReadDoc(collectionName, idToRead);
    if (doc) {
      formData.value = normalizeData<T>(doc.data, createEmptyData());
      formId.value = doc.id;
      hasChanges.value = false;
    } else {
      console.log(`Dokument s ID '${idToRead}' nebyl nalezen v kolekci '${collectionName}'.`);
      notify(`Záznam s ID '${idToRead}' nebyl nalezen. Budete přesměrováni na vytvoření nového záznamu.`, 'negative', undefined, 5000)
      await router.push(`/${pageName}/new`);
    }
  } catch (e) {
    notifyError('Chyba při čtení dokumentu:', e);
    await router.push(`/${pageName}/new`);
  }
};

export const handleRevertChanges = async <T extends Record<string, any>>(props: FormHandlerProps<T>): Promise<void> => {
  const { formId, formData, hasChanges, createEmptyData } = props;

  if (!formId.value) {
    console.warn('Nelze vrátit změny: Není načten žádný dokument ani nový formulář.');
    return;
  }
  if (confirm('Opravdu chcete vrátit všechny neuložené změny?')) {
    if (formId.value === 'new') {
      formData.value = createEmptyData();
      hasChanges.value = false;
      console.log('Formulář pro nový záznam byl resetován.');
    } else {
      await handleReadDoc(props, formId.value); // Voláme handleReadDoc s předanými props
      hasChanges.value = false;
      console.log('Změny byly vráceny opětovným načtením dokumentu.');
    }
  }
};

export const handleAddDoc = async <T extends Record<string, any>>(props: FormHandlerProps<T>): Promise<void> => {
  const { formData, hasChanges, collectionName, pageName, router } = props; // Destrukturalizujeme router z props

  if (!confirm(`Opravdu chcete vytvořit nový dokument v kolekci '${collectionName}'?`)) {
    console.log('Nevytvářím');
    return;
  }
  try {
    const docId = await useAddColl(collectionName, formData.value);
    if (docId) {
      hasChanges.value = false;
      await router.push(`/${pageName}/${docId}`);
      console.log(`Vytvořen dokument s ID: ${docId} v kolekci ${collectionName}`);
    }
  } catch (e) {
    notifyError('Chyba při ukládání z komponenty:', e);
  }
};

export const handleUpdateDoc = async <T extends Record<string, any>>(props: FormHandlerProps<T>): Promise<void> => {
  const { formId, formData, hasChanges, collectionName } = props; // Router není potřeba v této funkci

  if (!formId.value || formId.value === 'new') {
    console.warn('Nelze aktualizovat: Žádné platné ID dokumentu k úpravě.');
    return;
  }
  if (!confirm(`Opravdu chcete updatovat data s ID: ${formId.value} v kolekci '${collectionName}'?`)) {
    console.log('Neupravuji');
    return;
  }
  try {
    const success = await useUpdateDoc(collectionName, formId.value, formData.value);
    if (success) {
      console.log(`Dokument s ID '${formId.value}' v kolekci '${collectionName}' byl úspěšně aktualizován!`);
      hasChanges.value = false;
    } else {
      console.log('Dokument nebyl aktualizován (neznámý důvod).');
    }
  } catch (e) {
    notifyError('Došlo k chybě při aktualizaci dokumentu:', e);
  }
};

export const handleDelDoc = async <T extends Record<string, any>>(props: FormHandlerProps<T>): Promise<void> => {
  const { formId, formData, hasChanges, collectionName, pageName, createEmptyData, router } = props; // Destrukturalizujeme router z props

  if (!formId.value || formId.value === 'new') {
    console.warn('Žádné platné ID dokumentu k smazání.');
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
      formData.value = createEmptyData();
      formId.value = 'new';
      hasChanges.value = false;
      await router.push(`/${pageName}`);
    } else {
      console.log('Dokument nebyl smazán (neznámý důvod).');
    }
  } catch (e) {
    notifyError('Došlo k chybě při mazání dokumentu:', e);
  }
};

// --- Samostatná exportovaná funkce pro watch logiku ---
export function useWatchRouteId<T extends Record<string, any>>(props: FormHandlerProps<T>): void {
  const { route } = props; // Získáváme instanci 'route' z props, ne voláním useRoute() zde

  watch(() => route.params.id, async (newIdParam) => {
    const id = newIdParam as string;
    const { formId, formData, hasChanges, pageName, createEmptyData } = props;

    if (id === 'new') {
      console.log(`Routa je /${pageName}/new, inicializuji formulář pro nový záznam.`);
      formId.value = 'new';
      formData.value = createEmptyData();
      hasChanges.value = false;
    } else if (id) {
      console.log(`ID v URL se změnilo na '${id}', načítám záznam.`);
      formId.value = id;
      await handleReadDoc(props, id); // Voláme handleReadDoc s předanými props
    } else {
      console.warn('Neočekávaný stav: ID v URL chybí.');
      formId.value = null;
      formData.value = createEmptyData();
      hasChanges.value = false;
    }
  }, { immediate: true });
}

// --- Samostatná exportovaná funkce pro onBeforeRouteLeave logiku
export function useConfirmRouteLeave<T extends Record<string, any>>(props: FormHandlerProps<T>): void {
  // Destrukturalizujeme hasChanges z objektu props
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
// Nyní inicializuje refy, ZÍSKÁ router a route instance a vrací je spolu s _handlerProps.
export function useDocHandlers<T extends Record<string, any>>(
  collectionName: string,
  pageName: string,
  createEmptyData: () => T
) {
  const formId = ref<string | null>(null);
  const formData = ref<T>(createEmptyData());
  const hasChanges = ref<boolean>(false);

  // Získáme instance routeru a routy ZDE, v kontextu setup()
  const router = useRouter();
  const route = useRoute();

  const handlerProps: FormHandlerProps<T> = {
    formId,
    formData,
    hasChanges,
    collectionName,
    pageName,
    createEmptyData,
    router, // Předáváme router
    route   // Předáváme route
  };

  return {
    formId,
    formData,
    hasChanges,
    _handlerProps: handlerProps
  };
}