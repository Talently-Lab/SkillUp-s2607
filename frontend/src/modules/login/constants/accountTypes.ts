import type { AccountType } from "../../../shared/types/account";

export const copy: Record<
  AccountType,
  {
    title: string;
    subtitle: string;
    emailLabel: string;
    placeholder: string;
    submit: string;
  }
> = {
  student: {
    title: "Hola de nuevo",
    subtitle: "Inicia sesión para continuar con tus cursos.",
    emailLabel: "Email",
    placeholder: "tu@email.com",
    submit: "Iniciar sesión",
  },
  teacher: {
    title: "Acceso docentes",
    subtitle: "Gestiona tus cursos, temarios y alumnos.",
    emailLabel: "Email",
    placeholder: "nombre@skillup.edu",
    submit: "Entrar al panel docente",
  },
  admin: {
    title: "Acceso administradores",
    subtitle: "Gestiona los cursos y contenidos del campus.",
    emailLabel: "Email institucional",
    placeholder: "nombre@skillup.edu",
    submit: "Entrar al panel",
  },
};
