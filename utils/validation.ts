import { isValidFrenchPhone, normalizePhone } from "./phone";
import type { BanAddress } from "./geocoding";

export const MAX_PHOTOS = 5;
export const MIN_DESCRIPTION_LENGTH = 10;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export interface ClientFormValues {
  categoryId: string;
  description: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
}

export type ClientFormErrors = Partial<
  Record<keyof ClientFormValues | "photos", string>
>;

export interface ValidateClientFormOptions {
  selectedAddress?: BanAddress | null;
  /** true lorsque clientAddressId est présent (validation serveur) */
  addressSelected?: boolean;
}

export function validateClientForm(
  values: ClientFormValues,
  photoCount: number,
  options?: ValidateClientFormOptions
): ClientFormErrors {
  const errors: ClientFormErrors = {};

  if (!values.categoryId) {
    errors.categoryId = "Veuillez sélectionner une catégorie.";
  }

  const description = values.description.trim();
  if (!description) {
    errors.description = "Veuillez décrire votre problème.";
  } else if (description.length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères.`;
  }

  if (!values.clientName.trim()) {
    errors.clientName = "Veuillez indiquer votre nom complet.";
  }

  if (!values.clientPhone.trim()) {
    errors.clientPhone = "Le téléphone est obligatoire.";
  } else if (!isValidFrenchPhone(values.clientPhone)) {
    errors.clientPhone = "Numéro de téléphone invalide.";
  }

  const addressValid =
    Boolean(options?.selectedAddress) || Boolean(options?.addressSelected);

  if (!addressValid) {
    if (!values.clientAddress.trim()) {
      errors.clientAddress = "L'adresse complète est obligatoire.";
    } else {
      errors.clientAddress =
        "Veuillez sélectionner une adresse dans la liste de suggestions.";
    }
  }

  if (photoCount > MAX_PHOTOS) {
    errors.photos = `Maximum ${MAX_PHOTOS} photos.`;
  }

  return errors;
}

export function sanitizeClientForm(values: ClientFormValues): ClientFormValues {
  return {
    categoryId: values.categoryId,
    description: values.description.trim(),
    clientName: values.clientName.trim(),
    clientPhone: normalizePhone(values.clientPhone.trim()),
    clientAddress: values.clientAddress.trim(),
  };
}

export function hasFormErrors(errors: ClientFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
