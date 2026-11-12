import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";

import { Aurora } from "@/shared/components/aurora/Aurora";
import { FormField } from "@/shared/components/FormField";
import { Icon } from "@/shared/components/Icon";
import { Loader } from "@/shared/components/Loader";
import { PasswordToggle } from "@/shared/components/PasswordToggle";
import {
  AccountTypeMismatchError,
  useAuthStore,
} from "@/shared/stores/authStore";
import { roleHome } from "@/shared/utils/roles";
import { authErrorMessage } from "@/modules/auth/utils/authErrorMessage";
import {
  validateLogin,
  type LoginErrors,
  type LoginValues,
} from "@/modules/auth/utils/validateLogin";
import "./AdminLogin.css";

/** Internal access at /admin/login: no public links, no Google, no sign up */
export function AdminLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [failure, setFailure] = useState<{
    message: string;
    wrongRole: boolean;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const redirectParam = params.get("redirect");
  const redirect =
    redirectParam?.startsWith("/admin") && !redirectParam.startsWith("//")
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
    setFailure(null);
    try {
      await login(values, ["admin"]);
      navigate(redirect ?? roleHome.admin, { replace: true });
    } catch (error) {
      setFailure({
        message: authErrorMessage(error),
        wrongRole: error instanceof AccountTypeMismatchError,
      });
      setLoading(false);
    }
  };

  return (
    <main className="admin-gate aurora-host">
      <Aurora shade="center" />
      <div className="admin-gate__card">
        <span className="admin-gate__brand">
          <span className="fox" aria-hidden="true" />
          <span>
            Skill<b>Up</b> Campus
          </span>
        </span>
        <h1 className="display admin-gate__title">Administración</h1>
        <p className="admin-gate__sub">
          Entrá con tu email institucional para gestionar el campus.
        </p>

        <form className="admin-gate__form" onSubmit={handleSubmit} noValidate>
          {failure && (
            <p className="admin-gate__error" role="alert">
              <Icon name="alert" />
              <span>
                {failure.wrongRole ? (
                  <>
                    Esta cuenta no tiene acceso de administrador. Si sos alumno
                    o docente, entrá desde{" "}
                    <Link to="/login">el acceso general</Link>.
                  </>
                ) : (
                  failure.message
                )}
              </span>
            </p>
          )}
          <FormField
            id="admin-email"
            label="Email institucional"
            type="email"
            autoComplete="username"
            placeholder="nombre@skillupcampus.com"
            value={values.email}
            onChange={(event) => handleChange("email", event.target.value)}
            error={errors.email}
            disabled={loading}
          />
          <FormField
            id="admin-password"
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
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
            className="btn btn-teal btn-block admin-gate__submit"
            disabled={loading}
          >
            {loading && <Loader />}
            {loading ? "Entrando…" : "Entrar al panel"}
          </button>
        </form>

        <p className="admin-gate__foot">
          Esta página no aparece en el sitio público. ¿No sos admin? Usá el{" "}
          <Link to="/login">acceso general</Link>.
        </p>
      </div>
    </main>
  );
}
