export const termsUpdatedAt = "septiembre 2026";

export const supportEmail = "soporte@skillupcampus.com";

export type TermsSection = {
  id: string;
  title: string;
  body: string;
};

export const termsSections: TermsSection[] = [
  {
    id: "aceptacion",
    title: "Aceptación de los términos",
    body: "Al crear una cuenta y utilizar SkillUp Campus, aceptás estos Términos y Condiciones en su totalidad. Si no estás de acuerdo, no debés usar el servicio.",
  },
  {
    id: "servicio",
    title: "Descripción del servicio",
    body: "SkillUp Campus es una plataforma que permite acceder a contenidos y herramientas formativas. El checkout o registro es simulado y no se realizan cobros reales.",
  },
  {
    id: "registro",
    title: "Registro y cuenta",
    body: "Para acceder a la plataforma debés registrarte con un email válido y una contraseña segura. Sos responsable de mantener la confidencialidad de tus credenciales.",
  },
  {
    id: "uso-aceptable",
    title: "Uso aceptable",
    body: "Queda prohibido usar SkillUp Campus para actividades fraudulentas, enviar spam, intentar acceder a cuentas ajenas o interferir con el correcto funcionamiento del servicio.",
  },
  {
    id: "disponibilidad",
    title: "Disponibilidad del servicio",
    body: "SkillUp Campus se ofrece “tal cual” sin garantías de disponibilidad continua. El servicio puede sufrir interrupciones por mantenimiento sin previo aviso.",
  },
  {
    id: "responsabilidad",
    title: "Limitación de responsabilidad",
    body: "En ningún caso SkillUp Campus será responsable por daños indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso del servicio.",
  },
  {
    id: "modificaciones",
    title: "Modificaciones",
    body: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entran en vigor al publicarse en esta página.",
  },
  {
    id: "contacto",
    title: "Contacto",
    body: "Para consultas sobre estos términos podés contactarnos en",
  },
];
