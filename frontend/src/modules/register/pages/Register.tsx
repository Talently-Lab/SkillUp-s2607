import { useState, type FormEvent } from "react";
import { Link } from "react-router";

import { AuthLayout } from "../../../layouts/AuthLayout";
import { AccountTypeToggle } from "../../../shared/components/AccountTypeToggle";
import { AuthDivider } from "../../../shared/components/AuthDivider";
import { FormField } from "../../../shared/components/FormField";
import { GoogleButton } from "../../../shared/components/GoogleButton";
import { PasswordToggle } from "../../../shared/components/PasswordToggle";
import { copy } from "../constants/accountTypes";
import { NAME_MAX_LENGTH } from "../constants/name";
import { PASSWORD_MIN_LENGTH, strengthMeta } from "../constants/password";
import {
  validateRegister,
  type RegisterErrors,
  type RegisterValues,
} from "../utils/validateRegister";
import type { AccountType } from "../../../shared/types/account";
import { getPasswordStrength } from "../../../shared/utils/validation";
import "./Register.css";

export function Register() {
  const [accountType, setAccountType] = useState<AccountType>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState<RegisterValues>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const text = accountType === "teacher" ? copy.teacher : copy.student;
  const strength = getPasswordStrength(values.password);
  const { label: strengthLabel, modifier: strengthModifier } =
    strengthMeta[strength];

  const handleChange = (field: keyof RegisterValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors(validateRegister(values));
  };

  return (
    <AuthLayout
      quote="Me registré en menos de un minuto y esa misma noche ya estaba en mi primera clase."
      author="Javier Ramírez"
      role="Estudiante de Diseño UX"
    >
      <div className="register__toggle">
        <AccountTypeToggle
          value={accountType}
          options={["student", "teacher"]}
          onChange={(type) => {
            setAccountType(type);
            setErrors({});
          }}
        />
      </div>

      <h1 className="register__title">{text.title}</h1>
      <p className="register__subtitle">{text.subtitle}</p>

      <div className="register__google">
        <GoogleButton />
      </div>

      <AuthDivider />

      <form className="register__form" onSubmit={handleSubmit} noValidate>
        <p className="register__required-note">
          Los campos marcados con{" "}
          <span className="register__required-mark">*</span> son obligatorios.
        </p>
        <FormField
          id="register-name"
          label={text.nameLabel}
          autoComplete="name"
          placeholder={text.namePlaceholder}
          required
          maxLength={NAME_MAX_LENGTH}
          value={values.name}
          onChange={(event) => handleChange("name", event.target.value)}
          error={errors.name}
        />
        <FormField
          id="register-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          required
          value={values.email}
          onChange={(event) => handleChange("email", event.target.value)}
          error={errors.email}
        />
        <FormField
          id="register-password"
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`}
          required
          value={values.password}
          onChange={(event) => handleChange("password", event.target.value)}
          error={errors.password}
          trailing={
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((visible) => !visible)}
            />
          }
          hint={
            <div className="register__strength">
              <div className="register__strength-bars" aria-hidden="true">
                {[1, 2, 3].map((segment) => (
                  <span
                    key={segment}
                    className={
                      strength >= segment
                        ? `register__strength-bar register__strength-bar--${strengthModifier}`
                        : "register__strength-bar"
                    }
                  />
                ))}
              </div>
              <span className="register__strength-label" aria-live="polite">
                {strengthLabel}
              </span>
            </div>
          }
        />

        <button type="submit" className="register__submit">
          {text.submit}
        </button>

        <p className="register__terms">
          Al continuar aceptas los{" "}
          <button type="button" className="register__terms-link">
            Términos
          </button>{" "}
          y la{" "}
          <button type="button" className="register__terms-link">
            Política de privacidad
          </button>
          .
        </p>
      </form>

      <p className="register__login">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="register__login-link">
          Inicia sesión
        </Link>
      </p>
      <p className="register__admin">
        ¿Eres administrador?{" "}
        <Link to="/login?tipo=admin" className="register__admin-link">
          Accede aquí
        </Link>
      </p>
    </AuthLayout>
  );
}
