import { z } from 'zod';

export const addressSchema = z.object({
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  street: z.string().nullable().optional(),
  houseNr: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

// Zde definujeme typ na základě schématu
export type AddressType = z.infer<typeof addressSchema>;

// Funkce pro vytvoření prázdného objektu, která je úzce spojená se schématem
export const createEmptyAddress = (): AddressType => ({
  country: '',
  city: '',
  street: '',
  houseNr: '',
  postalCode: '',
  note: '',
});