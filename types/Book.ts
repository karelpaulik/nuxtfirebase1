import type { User } from '@/types/User';

export interface Book {
  id: string;   //Nutno pro referenci na book.
  title: string;
  author: string;
  createdDate: Date;
  currUserRefUsers: User | null;    //reference na uživatele
}