import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import { AuthLayout } from "@/layouts/AuthLayout";
import { AuthDivider } from "@/shared/components/AuthDivider";
import { FormField } from "@/shared/components/FormField";
import { GoogleButton } from "@/shared/components/GoogleButton";
import { Icon } from "@/shared/components/Icon";
import { Loader } from "@/shared/components/Loader";
import { PasswordToggle } from "@/shared/components/PasswordToggle";
import { useAuthStore } from "@/shared/stores/authStore";
import { GENERAL_ROLES, roleHome } from "@/shared/utils/roles";
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
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
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
      const signedIn = await login(values, GENERAL_ROLES);
      navigate(redirect ?? roleHome[signedIn.role], { replace: true });
    } catch (error) {
      toast.error(authErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={["Aprendé a tu ritmo,", "terminá lo que empezás."]}
      quote="Terminé tres cursos mientras trabajaba. Tener todo en un solo lugar me ahorró horas cada semana."
      author="Camila Torres"
      role="Analista de datos"
      initials="CT"
    >
      <h1 className="display login__title">Hola de nuevo</h1>
      <p className="login__subtitle">Iniciá sesión para seguir con tus cursos.</p>

      <div className="login__google">
        <GoogleButton soon disabled={loading} />
      </div>

      <AuthDivider />

      <form className="login__form" onSubmit={handleSubmit} noValidate>
        <FormField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
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
          trailing={
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((visible) => !visible)}
            />
          }
        />

        <button
          type="submit"
          className="btn btn-primary btn-block login__submit"
          disabled={loading}
        >
          {loading && <Loader />}
          {loading ? "Iniciando sesión…" : "Iniciar sesión"}
        </button>
      </form>

      <p className="login__footer">
        ¿Todavía no tenés cuenta?{" "}
        <Link to="/register" className="login__register-link">
          Creá tu cuenta gratis
        </Link>
      </p>

      <p className="login__staff">
        <Icon name="book" />
        <span>
          <strong>¿Sos docente?</strong> Entrás desde acá con el email que te
          dio el equipo académico. Te llevamos directo a tu panel.
        </span>
      </p>
    </AuthLayout>
  );
}
