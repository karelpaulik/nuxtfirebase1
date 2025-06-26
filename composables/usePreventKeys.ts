/**
 * Composables pro blokování zadávání specifických kláves do inputu.
 *
 * @param charsToBlock Pole znaků (stringů), které mají být zablokovány.
 * @param showAlert Volitelný parametr. Pokud je 'true', zobrazí alert při stisknutí zakázané klávesy. Výchozí je 'false'.
 * @returns Funkce pro použití v @keydown eventu.
 */
export const usePreventKeys = (charsToBlock: string[], showAlert: boolean = false) => {
  return (event: KeyboardEvent) => {
    if (charsToBlock.includes(event.key)) {
      event.preventDefault(); // Zablokuje výchozí akci prohlížeče

      if (showAlert) { // Zobrazí alert pouze, pokud je showAlert nastaveno na true
        alert(`Not allowed key: ${event.key}`);
      }
    }
  };
};