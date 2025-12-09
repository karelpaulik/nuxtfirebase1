// composables/useDocHandlers.ts
import { ref, reactive, watch, type Ref } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave, type Router, type RouteLocationNormalizedLoaded } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import type { ZodObject, ZodRawShape } from 'zod';

import { useReadDoc, useAddColl, useUpdateDoc, useDelDoc } from '~/composables/useFirestore';
import { notifyError, notify, displayVeeValidateErrors, displayZodErrors } from './useNotify';
import { cleanObject } from '@/utils/cleanObject';
import { delay } from '~/utils/helpers';

/**
 * Interface pro props, které handlery potřebují.
 * Nyní předává celou instanci VeeValidate formuláře pro plnou kontrolu.
 */
interface FormHandlerProps<T extends Record<string, any>> {
    initialDocumentIdRef: Ref<string | undefined>;
    formId: Ref<string | null>;
    hasChanges: Ref<boolean>;
    loading: Ref<boolean>; // Přidáno: Reaktivní stav načítání
    error: Ref<Error | null>; // Přidáno: Reaktivní stav chyby
    collectionName: string;
    pageName: string;
    createEmptyData: () => T;
    router: Router;
    route: RouteLocationNormalizedLoaded;
    formVee: ReturnType<typeof useForm<T>>;
    apiSchema: ZodObject<ZodRawShape>;
}

// NOVÝ INTERFACE PRO VOLITELNOU KONFIGURACI
interface DocHandlersConfig {    
    watchIdOnLoad?: boolean;//Pokud true, ID dokumentu z propse bude sledováno a dokument se automaticky načte.    
    confirmLeave?: boolean;// Pokud true, uživatel bude upozorněn při pokusu o odchod se neuloženými změnami. 
}

// --- HLAVNÍ COMPOSABLE FUNKCE (UPRAVENO) ---
export function useDocHandlers<T extends Record<string, any>>(
    // Povinné poziční argumenty
    initialDocumentIdProp: Ref<string | undefined>,
    collectionName: string,
    pageName: string,
    createEmptyData: () => T,
    formSchema: ZodObject<ZodRawShape>,
    apiSchema: ZodObject<ZodRawShape>,
    // Volitelný konfigurační objekt, hodnoty za rovnítkem jsou defaultní hodnoty
    config: DocHandlersConfig = { watchIdOnLoad: true, confirmLeave: true }
) {
    const formId = ref<string | null>(null);
    const hasChanges = ref<boolean>(false);
    const loading = ref(false); // Nová proměnná pro stav načítání. Výchozí stav je false.
    const error = ref<Error | null>(null); // Nová proměnná pro chyby.

    const router = useRouter();
    const route = useRoute();

    // Inicializace VeeValidate formuláře
    const formVee = useForm<T>({
        validationSchema: toTypedSchema(formSchema),
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

    // Vytvoření objektu s props, který bude předán interním funkcím
    const handlerProps: FormHandlerProps<T> = {
        initialDocumentIdRef: initialDocumentIdProp,
        formId,
        hasChanges,
        loading, // Předáno do props
        error, // Předáno do props
        collectionName,
        pageName,
        createEmptyData,
        router,
        route,
        formVee,
        apiSchema,
    };

    /**
     * Zde jsou handlery definovány přímo uvnitř useDocHandlers
     * a jsou volány s handlerProps.
     * Tím se zjednoduší volání v komponentě (handleRevertChanges() místo handleRevertChanges(_handlerProps)).
     */
    const handleReadDoc = async (idToRead: string): Promise<void> => {
        const { formId, collectionName, router, formVee, apiSchema, loading, error, pageName } = handlerProps;

        loading.value = true; // Spuštění načítání
        error.value = null; // Reset chyby
        try {
            const doc = await useReadDoc(collectionName, idToRead);
            if (doc) {
                const validData = apiSchema.safeParse(doc.data);
                if (validData.success) {
                    console.log('Data úspěšně validována:', validData.data);
                    // Dříve: formVee.resetForm({ values: validData.data as T });
                    const dataWithId = { ...(validData.data as T), id: doc.id }; // Do objektu bez id, přidáme id
                    // Nastavíme hodnoty do VeeValidate formuláře a resetujeme jej
                    formVee.resetForm({ values: dataWithId }); // Tímto se nastaví nové hodnoty jako 'čisté' a meta.dirty/touched se resetuje na false
                    //hasChanges.value = false; // Automaticky se nastaví přes watch na formVee.meta.dirty
                    formId.value = doc.id;
                    notify('Dokument úspěšně načten!', 'positive');
                } else {
                    // validData.error.issues.forEach(issue => {
                    //     console.error(`Chyba na cestě: ${issue.path.join('.')}, Zpráva: ${issue.message}`);
                    //     notify(`Chyba na cestě: ${issue.path.join('.')}, Zpráva: ${issue.message}`, 'negative', 'top', 5000);
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
            error.value = e as Error; // Nastavíme chybu
            notifyError('Chyba při čtení dokumentu:', e);
            await router.push(`/${pageName}/new`);
        } finally {
            loading.value = false; // Ukončení načítání
        }
    };

    const handleRevertChanges = async (): Promise<void> => {
        const { formId, createEmptyData, formVee } = handlerProps;

        if (!formId.value) {
            console.warn('Nelze vrátit změny: Není načten žádný dokument ani nový formulář.');
            notify('Nelze vrátit změny: Není načten žádný dokument ani nový formulář.', 'warning');
            return;
        }
        if (confirm('Opravdu chcete vrátit všechny neuložené změny?')) {
            if (formId.value === 'new') {
                formVee.resetForm({ values: createEmptyData() }); // Reset VeeValidate form s prázdnými daty
                notify('Formulář pro nový záznam byl resetován!', 'positive');
                console.log('Formulář pro nový záznam byl resetován.');
            } else {
                await handleReadDoc(formId.value); // Znovu načte dokument a resetuje formulář (zde je již loading a error ošetřen)
                notify('Změny byly vráceny!', 'positive');
                console.log('Změny byly vráceny opětovným načtením dokumentu.');
            }
        }
    };

    const handleAddDoc = async (): Promise<void> => {
        const { collectionName, pageName, router, formVee, loading, error } = handlerProps;

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

        loading.value = true; // Spuštění načítání
        error.value = null; // Reset chyby
        try {
            const cleanedData = cleanObject(values); // <-- Čištění dat před odesláním. Tj. odstranění props s hodnotou "undefined".
            // console.log('Formvee.values', formVee.values);
            // console.log('Formvee.values.fName', formVee.values.fName);
            // console.log('Raw data:', formVee);
            // console.log('Validated data:', values);
            // console.log('Cleaned data:', cleanedData);
            const { id, ...dataToSave } = cleanedData; // Remove id before saving: dataToSave - objekt bez id
            // Dříve: const docId = await useAddColl(collectionName, cleanedData); // Použijeme validované hodnoty
            const docId = await useAddColl(collectionName, dataToSave); // Použijeme hodnoty: 1. validované (props bez value=undefined), 2. bez prop: id
            if (docId) {
                formVee.resetForm(); // Reset VeeValidate form po uložení (resetuje na initialValues)
                await router.push(`/${pageName}/${docId}`);
                notify('Dokument úspěšně vytvořen!', 'positive');
                console.log(`Vytvořen dokument s ID: ${docId} v kolekci ${collectionName}`);
            }
        } catch (e) {
            error.value = e as Error; // Nastavíme chybu
            notifyError('Chyba při ukládání z komponenty:', e);
        } finally {
            loading.value = false; // Ukončení načítání
        }
    };

    const handleUpdateDoc = async (confirmUpdate = true): Promise<void> => {
        const { formId, collectionName, formVee, loading, error } = handlerProps;

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
        if (confirmUpdate && !confirm(`Opravdu chcete updatovat data s ID: ${formId.value} v kolekci '${collectionName}'?`)) {
            console.log('Neupravuji');
            return;
        }
        
        loading.value = true; // Spuštění načítání
        error.value = null; // Reset chyby
        try {
            if (import.meta.env.DEV) { // Pouze pro testovací účely. V produkci bude vynecháno.
                await delay(1000); // 2 sekundy zpoždění pro simulaci pomalé sítě
                //throw new Error('Simulovaná chyba při ukládání nového záznamu!');
            }
            const cleanedData = cleanObject(values); // <-- Čištění dat před odesláním. Tj. odstranění props s hodnotou "undefined".
            const { id, ...dataToSave } = cleanedData; // Remove id before saving: dataToSave - objekt bez id
            const success = await useUpdateDoc(collectionName, formId.value, dataToSave); // Použijeme validované hodnoty
            if (success) {
                console.log(`Dokument s ID '${formId.value}' v kolekci '${collectionName}' byl úspěšně aktualizován!`);
                formVee.resetForm({ values: values as T }); // Reset VeeValidate form po uložení, ale zachovat aktuální hodnoty jako nové 'čisté'
                notify('Dokument úspěšně aktualizován!', 'positive');
            } else {
                console.log('Dokument nebyl aktualizován (neznámý důvod).');
                notify('Dokument nebyl aktualizován.', 'info');
            }
        } catch (e) {
            error.value = e as Error; // Nastavíme chybu
            notifyError('Došlo k chybě při aktualizaci dokumentu:', e);
        } finally {
            loading.value = false; // Ukončení načítání
        }
    };

    const handleDelDoc = async (): Promise<void> => {
        const { formId, collectionName, pageName, createEmptyData, router, formVee, loading, error } = handlerProps; // Destrukturalizujeme loading a error

        if (!formId.value || formId.value === 'new') {
            console.warn('Žádné platné ID dokumentu k smazání.');
            notify('Žádné platné ID dokumentu k smazání.', 'warning');
            return;
        }
        if (!confirm(`Opravdu chcete smazat data s ID: ${formId.value} z kolekce '${collectionName}'?`)) {
            console.log('Nemažu');
            return;
        }

        loading.value = true; // Spuštění načítání
        error.value = null; // Reset chyby
        try {
            const success = await useDelDoc(collectionName, formId.value);
            if (success) {
                console.log(`Dokument s ID '${formId.value}' z kolekce '${collectionName}' byl úspěšně smazán!`);
                formVee.resetForm({ values: createEmptyData() }); // Reset VeeValidate form s prázdnými daty
                formId.value = 'new';
                await router.push(`/${pageName}`);
                notify('Dokument úspěšně smazán!', 'positive');
            } else {
                console.log('Dokument nebyl smazán (neznámý důvod).');
                notify('Dokument nebyl smazán.', 'info');
            }
        } catch (e) {
            error.value = e as Error; // Nastavíme chybu
            notifyError('Došlo k chybě při mazání dokumentu:', e);
        } finally {
            loading.value = false; // Ukončení načítání
        }
    };

    // Interní funkce pro watch a onBeforeRouteLeave, které budou volány uvnitř hlavní funkce
    const useWatchDocumentId = (): void => {
        watch(() => handlerProps.initialDocumentIdRef.value, async (newIdParam) => {
            const id = newIdParam as string;
            const { formId, createEmptyData, formVee } = handlerProps;
        
            if (id === 'new') {
                console.log(`Document ID prop je 'new', inicializuji formulář pro nový záznam.`);
                formId.value = 'new';
                formVee.resetForm({ values: createEmptyData() }); // Reset VeeValidate form s prázdnými daty
            } else if (id) {
                console.log(`Document ID prop se změnilo na '${id}', načítám záznam.`);
                formId.value = id;
                await handleReadDoc(id); // handleReadDoc se postará o loading/error
            } else {
                console.warn('Neočekávaný stav: Document ID prop chybí nebo je neplatné.');
                formId.value = null;
                formVee.resetForm({ values: createEmptyData() }); // Reset VeeValidate form s prázdnými daty
            }
        }, { immediate: true });
    };
    
    const useConfirmRouteLeave = (): void => {
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
    };

    // Default je true, ale pokud uživatel zadá { watchIdOnLoad: false }, nebude spuštěno
    if (config.watchIdOnLoad) { 
        useWatchDocumentId();
    }

    // Default je true, ale pokud uživatel zadá { confirmLeave: false }, nebude spuštěno
    if (config.confirmLeave) {
        useConfirmRouteLeave();
    }
    // --------------------------------------------------------

    return {
        formId,
        formData, // Vracíme náš speciální 'formData' objekt s Ref pro v-model
        hasChanges,
        loading, // Přidáno: Vracíme loading stav
        error, // Přidáno: Vracíme error stav
        formVee, // <-- Vracíme celou instanci VeeValidate formuláře pro přístup z komponenty (např. pro debug)
        docHandlers: {
            handleRevertChanges,
            handleAddDoc,
            handleUpdateDoc,
            handleDelDoc,
        }
    };
}