import { onAuthStateChanged } from 'firebase/auth';
import { useLoggedUser } from '~/composables/useLoggedUser';

export default defineNuxtPlugin(() => {
  // Spustí se pouze jednou při startu aplikace na klientovi
  const { $fireAuth } = useNuxtApp();
  const { user } = useLoggedUser();

  // Naslouchání změn přihlášení přímo z Firebase
  onAuthStateChanged($fireAuth, (authUser) => {
    user.value = authUser;
    console.log(
      'Auth stav změněn přímo v pluginu. Aktuální uživatel:', authUser?.email || 'uživatel nepřihlášen',
    );
  });
});
