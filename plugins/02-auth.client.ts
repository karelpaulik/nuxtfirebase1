import { onAuthStateChanged } from 'firebase/auth';
import { useLoggedUser } from '~/composables/useLoggedUser';

export default defineNuxtPlugin(() => {
  // Spustí se pouze jednou při startu aplikace na klientovi
  const { $fireAuth } = useNuxtApp();
  const { loggedUser, claims } = useLoggedUser();

  // Naslouchání změn přihlášení přímo z Firebase
  onAuthStateChanged($fireAuth, async (authUser) => {
    if (authUser) {
      loggedUser.value = authUser;
      const tokenResult = await authUser.getIdTokenResult(true);
      claims.value = tokenResult.claims;
      console.log('Aktuální uživatel:', authUser?.email || 'uživatel nepřihlášen');
      console.log('Aktuální uživatel:', loggedUser.value);
      console.log('Claims: ', claims.value);
    } else {
      loggedUser.value = null;
      claims.value = null;
      console.log(
        'Auth stav změněn přímo v pluginu. Uživatel nepřihlášen.',
      );
    }
  });
});

