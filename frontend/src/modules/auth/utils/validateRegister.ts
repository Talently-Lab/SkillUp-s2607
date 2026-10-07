import { isValidEmail } from "@/shared/utils/validation";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
} from "@/modules/auth/constants/name";
import { PASSWORD_MIN_LENGTH } from "@/modules/auth/constants/password";

export type RegisterValues = {
  name: string;
  email: string;
  password: string;
};

export type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

export function validateRegister({
  name,
  email,
  password,
}: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  const trimmedName = name.trim();
  if (!trimmedName) errors.name = "Ingresa tu nombre.";
  else if (trimmedName.length < NAME_MIN_LENGTH)
    errors.name = `Usa al menos ${NAME_MIN_LENGTH} caracteres.`;
  else if (trimmedName.length > NAME_MAX_LENGTH)
    errors.name = `Usa como máximo ${NAME_MAX_LENGTH} caracteres.`;

  if (!email.trim()) errors.email = "Ingresa tu email.";
  else if (!isValidEmail(email)) errors.email = "Ingresa un email válido.";

  if (!password) errors.password = "Ingresa una contraseña.";
  else if (password.length < PASSWORD_MIN_LENGTH)
    errors.password = `Usa al menos ${PASSWORD_MIN_LENGTH} caracteres.`;

  return errors;
}
