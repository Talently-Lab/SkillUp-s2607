import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";

import { AuthLayout } from "../../../layouts/AuthLayout";
import { AccountTypeToggle } from "../../../shared/components/AccountTypeToggle";
import { AuthDivider } from "../../../shared/components/AuthDivider";
import { FormField } from "../../../shared/components/FormField";
import { GoogleButton } from "../../../shared/components/GoogleButton";
import { PasswordToggle } from "../../../shared/components/PasswordToggle";
import { copy } from "../constants/loginCopy";
import { accountTypeFromParam } from "../utils/accountTypeFromParam";
import {
  validateLogin,
  type LoginErrors,
  type LoginValues,
} from "../utils/validateLogin";
import type { AccountType } from "../../../shared/types/account";
import "./Login.css";

export function Login() {
  const [params] = useSearchParams();
  const [accountType, setAccountType] = useState<AccountType>(() =>
    accountTypeFromParam(params.get("tipo")),
  );
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const text = copy[accountType];
  const isAdmin = accountType === "admin";

  const handleChange = (field: keyof LoginValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors(validateLogin(values));
  };

  return (
    <AuthLayout
      quote="Terminé tres cursos mientras trabajaba. Tener todo en un solo lugar me ahorró horas cada semana."
      author="Camila Torres"
      role="Analista de datos"
    >
      <div className="login__toggle">
        <AccountTypeToggle
          value={accountType}
          onChange={(type) => {
            setAccountType(type);
            setErrors({});
          }}
        />
      </div>

      <h1 className="login__title">{text.title}</h1>
      <p className="login__subtitle">{text.subtitle}</p>

      {!isAdmin && (
        <>
          <div className="login__google">
            <GoogleButton />
          </div>

          <AuthDivider />
        </>
      )}

      <form
        className={isAdmin ? "login__form login__form--spaced" : "login__form"}
        onSubmit={handleSubmit}
        noValidate
      >
        <FormField
          id="login-email"
          label={text.emailLabel}
          type="email"
          autoComplete="email"
          placeholder={text.emailPlaceholder}
          required
          value={values.email}
          onChange={(event) => handleChange("email", event.target.value)}
          error={errors.email}
        />
        <FormField
          id="login-password"
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          required
          value={values.password}
          onChange={(event) => handleChange("password", event.target.value)}
          error={errors.password}
          labelAction={
            <button type="button" className="login__forgot">
              ¿Olvidaste tu contraseña?
            </button>
          }
          trailing={
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((visible) => !visible)}
            />
          }
        />

        <button type="submit" className="login__submit">
          {text.submit}
        </button>
      </form>

      {isAdmin ? (
        <p className="login__footer">
          Las cuentas de administrador las crea el equipo académico.
        </p>
      ) : (
        <p className="login__footer">
          ¿Aún no tienes cuenta?{" "}
          <Link to="/register" className="login__register-link">
            {accountType === "teacher"
              ? "Solicita tu cuenta docente"
              : "Regístrate gratis"}
          </Link>
        </p>
      )}
    </AuthLayout>
  );
}
