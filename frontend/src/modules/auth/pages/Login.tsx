import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";

import { AuthLayout } from "@/layouts/AuthLayout";
import { AccountTypeToggle } from "@/shared/components/AccountTypeToggle";
import { AuthDivider } from "@/shared/components/AuthDivider";
import { FormField } from "@/shared/components/FormField";
import { GoogleButton } from "@/shared/components/GoogleButton";
import { PasswordToggle } from "@/shared/components/PasswordToggle";
import { useAuth } from "@/shared/hooks/useAuth";
import { mockUsers } from "@/shared/mocks/users";
import { AuthError } from "@/shared/services/authService";
import type { AccountType } from "@/shared/types/account";
import type { AuthUser } from "@/shared/types/auth";
import { roleHome } from "@/shared/utils/roles";
import { copy } from "@/modules/auth/constants/loginCopy";
import { accountTypeFromParam } from "@/modules/auth/utils/accountTypeFromParam";
import {
  validateLogin,
  type LoginErrors,
  type LoginValues,
} from "@/modules/auth/utils/validateLogin";
import "./Login.css";

type Status = "idle" | "loading" | "google";

export function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, login, loginWithGoogle } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>(() =>
    accountTypeFromParam(params.get("tipo")),
  );
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const text = copy[accountType];
  const isAdmin = accountType === "admin";
  const busy = status !== "idle";
  const demoUser = mockUsers.find((item) => item.role === accountType);
  // Only same-site paths, so the param can't send the user to another domain
  const redirectParam = params.get("redirect");
  const redirect =
    redirectParam?.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : null;

  if (user && status === "idle")
    return <Navigate to={roleHome[user.role]} replace />;

  const handleChange = (field: keyof LoginValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError("");
  };

  const authenticate = async (
    action: () => Promise<AuthUser>,
    next: Status,
  ) => {
    setStatus(next);
    setFormError("");
    try {
      const signedIn = await action();
      navigate(redirect ?? roleHome[signedIn.role], { replace: true });
    } catch (error) {
      setFormError(
        error instanceof AuthError
          ? error.message
          : "No pudimos iniciar sesión. Inténtalo de nuevo.",
      );
      setStatus("idle");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    authenticate(() => login({ ...values, role: accountType }), "loading");
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
            setFormError("");
          }}
        />
      </div>

      <h1 className="login__title">{text.title}</h1>
      <p className="login__subtitle">{text.subtitle}</p>

      {/* TODO: quitar la cuenta demo cuando el login use la API */}
      {demoUser && (
        <p className="login__demo">
          Demo: <strong>{demoUser.email}</strong> · contraseña{" "}
          <strong>{demoUser.password}</strong>
        </p>
      )}

      {!isAdmin && (
        <>
          <div className="login__google">
            <GoogleButton
              onClick={() => authenticate(loginWithGoogle, "google")}
              loading={status === "google"}
              disabled={busy}
            />
          </div>

          <AuthDivider />
        </>
      )}

      <form
        className={isAdmin ? "login__form login__form--spaced" : "login__form"}
        onSubmit={handleSubmit}
        noValidate
      >
        {formError && (
          <p className="login__error" role="alert">
            {formError}
          </p>
        )}
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
          disabled={busy}
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
          disabled={busy}
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

        <button type="submit" className="login__submit" disabled={busy}>
          {status === "loading" ? "Iniciando sesión…" : text.submit}
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
