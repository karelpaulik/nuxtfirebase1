// useNotify.ts

import { Notify } from 'quasar'; // Importujeme Notify pro typování, i když se používá $q.notify
import type { ZodError, ZodIssue } from 'zod'; // Importujeme typy pro Zod chyby

/**
 * Zobrazí obecnou notifikaci Quasar.
 * @param message Zpráva notifikace.
 * @param color Barva notifikace (např. 'primary', 'negative', 'positive').
 * @param position Pozice notifikace na obrazovce.
 * @param timeout Doba zobrazení notifikace v milisekundách.
 */
export const notify = (
  message: string,
  color: string = 'primary',
  position: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'top',
  timeout: number = 3000
) => {
  const { $q } = useNuxtApp(); // Získáváme instanci Quasar

  $q.notify({
    message,
    color,
    position,
    timeout,
    group: false // Zabraňuje seskupování notifikací
  });
};

/**
 * Zobrazí notifikaci chyby s volitelným detailem chyby.
 * @param message Hlavní zpráva chyby.
 * @param error Volitelný objekt chyby (Error, string, nebo jiný typ).
 * @param position Pozice notifikace.
 * @param timeout Doba zobrazení notifikace.
 */
export const notifyError = (
  message: string,
  error?: unknown, // může být cokoliv (např. Error, string, apod.)
  position: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'top',
  timeout: number = 5000
) => {
  const { $q } = useNuxtApp();

  // Vytáhne text chyby pokud existuje
  const errorText =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : '';

  // Zobrazí error notifikaci (přidá i text chyby, pokud existuje)
  $q.notify({
    message: `${message}${errorText ? `: ${errorText}` : ''}`,
    color: 'negative',
    position,
    timeout,
    group: false // Zabraňuje seskupování notifikací
  });

  // Vypíše do konzole detail chyby
  if (error) {
    console.error(`❌ ${message}:`, error);
  }
};

/**
 * Zobrazí notifikace pro chyby pocházející z VeeValidate.
 * Přijímá přímo objekt chyb ve formátu VeeValidate (Record<string, string>).
 * @param errors Objekt s chybami VeeValidate (např. { fieldName: 'Chybová zpráva' }).
 * @param position Pozice notifikace (volitelné, výchozí 'top').
 * @param timeout Doba zobrazení notifikace v ms (volitelné, výchozí 5000).
 */
export const displayVeeValidateErrors = (errors: Record<string, string>, position: Parameters<typeof Notify>[0]['position'] = 'top', timeout: number = 5000): void => {
  const { $q } = useNuxtApp();

  if (Object.keys(errors).length === 0) {
    return; // Žádné chyby k zobrazení
  }

  for (const fieldName in errors) {
    if (Object.prototype.hasOwnProperty.call(errors, fieldName)) {
      const message = `Pole '${fieldName}': ${errors[fieldName]}`;
      console.error(message); // Logujeme chybu do konzole
      $q.notify({
        message: message,
        color: 'negative',
        position: position,
        timeout: timeout,
        group: false // Zabraňuje seskupování notifikací
      });
    }
  }
};

/**
 * Zobrazí notifikace pro chyby pocházející ze Zod validace.
 * Přijímá přímo ZodError objekt.
 * @param zodError ZodError objekt obsahující detaily chyb.
 * @param position Pozice notifikace (volitelné, výchozí 'top').
 * @param timeout Doba zobrazení notifikace v ms (volitelné, výchozí 5000).
 */
export const displayZodErrors = (zodError: ZodError, position: Parameters<typeof Notify>[0]['position'] = 'top', timeout: number = 5000): void => {
  const { $q } = useNuxtApp();

  zodError.issues.forEach((issue: ZodIssue) => {
    const message = `Chyba na cestě: ${issue.path.join('.')}, Zpráva: ${issue.message}`;
    console.error(message); // Logujeme chybu do konzole pro debug
    $q.notify({
      message: message,
      color: 'negative',
      position: position,
      timeout: timeout,
      group: false // Zabraňuje seskupování notifikací
    });
  });
};
