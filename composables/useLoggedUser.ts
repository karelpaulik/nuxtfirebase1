import { useState } from '#app';
import type { User } from 'firebase/auth';

export const useLoggedUser = () => {
  const user = useState<User | null>('user', () => null);
  return { user };
};
