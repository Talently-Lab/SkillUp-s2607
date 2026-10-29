import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import { AuthLayout } from "@/layouts/AuthLayout";
import { AccountTypeToggle } from "@/shared/components/AccountTypeToggle";
import { AuthDivider } from "@/shared/components/AuthDivider";
import { FormField } from "@/shared/components/FormField";
import { GoogleButton } from "@/shared/components/GoogleButton";
import { Loader } from "@/shared/components/Loader";
import { PasswordToggle } from "@/shared/components/PasswordToggle";
import { useAuthStore } from "@/shared/stores/authStore";
import type { AccountType } from "@/shared/types/account";
import { roleHome } from "@/shared/utils/roles";
import { copy } from "@/modules/auth/constants/loginCopy";
import { accountTypeFromParam } from "@/modules/auth/utils/accountTypeFromParam";
import { authErrorMessage } from "@/modules/auth/utils/authErrorMessage";
import {
  validateLogin,
  type LoginErrors,
  type LoginValues,
} from "@/modules/auth/utils/validateLogin";
import "./Login.css";

export function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const [accountType, setAccountType] = useState<AccountType>(() =>
    accountTypeFromParam(params.get("tipo")),
  );
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const text = copy[accountType];
  const isAdmin = accountType === "admin";
  // Only same-site paths, so the param can't send the user to another domain
  const redirectParam = params.get("redirect");
  const redirect =
    redirectParam?.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : null;

  if (user && !loading) return <Navigate to={roleHome[user.role]} replace />;

  const handleChange = (field: keyof LoginValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const signedIn = await login(values, accountType);
      navigate(redirect ?? roleHome[signedIn.role], { replace: true });
    } catch (error) {
      toast.error(authErrorMessage(error));
      setLoading(false);
    }
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
          options={["student", "teacher", "admin"]}
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
            <GoogleButton
              onClick={() =>
                toast.info(
                  "El inicio de sesión con Google estará disponible pronto.",
                )
              }
              disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
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

        <button type="submit" className="login__submit" disabled={loading}>
          {loading && <Loader />}
          {loading ? "Iniciando sesión…" : text.submit}
        </button>
      </form>

      {accountType !== "student" ? (
        <p className="login__footer">
          Las cuentas {isAdmin ? "de administrador" : "docentes"} las crea el
          equipo académico.
        </p>
      ) : (
        <p className="login__footer">
          ¿Aún no tienes cuenta?{" "}
          <Link to="/register" className="login__register-link">
            Regístrate gratis
          </Link>
        </p>
      )}
    </AuthLayout>
  );
}
