/**
 * Asynchronně pozastaví provádění kódu po zadanou dobu.
 * Používá se s 'await' pro neblokující zpoždění.
 * * @param ms - Doba zpoždění v milisekundách (např. 2000 pro 2 sekundy).
 * @returns Promise, který se vyřeší po uplynutí zadaného času.
 */
export const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Použití - uvnitř async, s await:
// import { delay } from '~/utils/helpers';
// const handleSaveDoc = async () => {
//     await delay(2000);
// };