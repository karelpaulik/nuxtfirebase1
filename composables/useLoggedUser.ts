import { useState } from '#app';
import type { User, IdTokenResult } from 'firebase/auth';

export const useLoggedUser = () => {
  const loggedUser = useState<User | null>('user', () => null);
  const claims = useState<IdTokenResult['claims'] | null>('claims', () => null);
  return { loggedUser, claims };
};
