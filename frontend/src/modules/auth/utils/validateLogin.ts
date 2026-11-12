import { isValidEmail } from "../../../shared/utils/validation";

export type LoginValues = {
  email: string;
  password: string;
};

export type LoginErrors = Partial<Record<keyof LoginValues, string>>;

export function validateLogin({ email, password }: LoginValues): LoginErrors {
  const errors: LoginErrors = {};

  if (!email.trim()) errors.email = "Ingresá tu email.";
  else if (!isValidEmail(email)) errors.email = "Ingresá un email válido.";

  if (!password) errors.password = "Ingresá tu contraseña.";

  return errors;
}
