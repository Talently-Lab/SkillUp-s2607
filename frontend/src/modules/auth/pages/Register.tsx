import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "sonner";

import { AuthLayout } from "@/layouts/AuthLayout";
import { AuthDivider } from "@/shared/components/AuthDivider";
import { FormField } from "@/shared/components/FormField";
import { GoogleButton } from "@/shared/components/GoogleButton";
import { Icon } from "@/shared/components/Icon";
import { Loader } from "@/shared/components/Loader";
import { PasswordToggle } from "@/shared/components/PasswordToggle";
import { copy } from "@/modules/auth/constants/registerCopy";
import { authErrorMessage } from "@/modules/auth/utils/authErrorMessage";
import { NAME_MAX_LENGTH } from "@/modules/auth/constants/name";
import {
  PASSWORD_MIN_LENGTH,
  strengthMeta,
} from "@/modules/auth/constants/password";
import {
  validateRegister,
  type RegisterErrors,
  type RegisterValues,
} from "@/modules/auth/utils/validateRegister";
import { ApiError } from "@/shared/api/http";
import { useAuthStore } from "@/shared/stores/authStore";
import { roleHome } from "@/shared/utils/roles";
import { getPasswordStrength } from "@/shared/utils/validation";
import "./Register.css";

export function Register() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const register = useAuthStore((state) => state.register);
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState<RegisterValues>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);
  // The API only signs up students, teachers are out of the MVP
  const text = copy.student;
  const strength = getPasswordStrength(values.password);
  const { label: strengthLabel, modifier: strengthModifier } =
    strengthMeta[strength];

  if (user && !loading) return <Navigate to={roleHome[user.role]} replace />;

  const handleChange = (field: keyof RegisterValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const signedUp = await register(values);
      toast.success(`¡Te damos la bienvenida, ${signedUp.name.split(" ")[0]}!`);
      navigate(roleHome[signedUp.role], { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_TAKEN")
        setErrors({ email: "Ya existe una cuenta con este email." });
      toast.error(authErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={["Tu primera clase,", "hoy mismo."]}
      quote="Me registré en menos de un minuto y esa misma noche ya estaba en mi primera clase."
      author="Javier Ramírez"
      role="Estudiante de Diseño UX"
      initials="JR"
      topLink={{ to: "/login", label: "Iniciar sesión" }}
    >
      <h1 className="display register__title">{text.title}</h1>
      <p className="register__subtitle">{text.subtitle}</p>
      <ul className="register__perks">
        {["Sin tarjeta", "12 cursos gratis", "Certificado al terminar"].map((perk) => (
          <li key={perk}>
            <Icon name="check-circle" />
            {perk}
          </li>
        ))}
      </ul>

      <div className="register__google">
        <GoogleButton soon disabled={loading} />
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
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

        <button
          type="submit"
          className="btn btn-primary btn-block register__submit"
          disabled={loading}
        >
          {loading && <Loader />}
          {loading ? "Creando cuenta…" : text.submit}
        </button>

        <p className="register__terms">
          Al crear tu cuenta aceptás los{" "}
          <Link
            to="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="register__terms-link"
          >
            Términos
          </Link>{" "}
          y la{" "}
          <button type="button" className="register__terms-link">
            Política de privacidad
          </button>
          .
        </p>
      </form>

      <p className="register__login">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="register__login-link">
          Iniciá sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
