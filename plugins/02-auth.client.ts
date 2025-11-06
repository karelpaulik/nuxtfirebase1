import { useAuthListener } from '~/composables/useFireAuth';
import { useLoggedUser } from '~/composables/useLoggedUser';

export default defineNuxtPlugin((nuxtApp) => {
  // Spustí se pouze jednou při startu aplikace na klientovi

  const { user } = useLoggedUser();

  useAuthListener((newUser) => {
    user.value = newUser;
    console.log('Auth stav změněn přes plugin. Aktuální uživatel:', newUser?.email || 'uživatel nepřihlášen');
  });
});
