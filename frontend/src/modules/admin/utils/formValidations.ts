import type { Course } from "@/shared/types/course";
import type { FormErrors, FormState } from "@/modules/admin/types";

export function toForm(course: Course): FormState {
  return {
    title: course.title,
    categoryId: String(course.categoryId),
    instructorId: course.instructorId ?? "",
    level: course.level,
    status: course.status ?? "published",
    // Two decimals at most, the exact value can be 0.0666…
    durationHours: String(Math.round(course.durationHours * 100) / 100),
    price: course.price === null ? "" : String(course.price),
    isFree: course.price === null,
    image: course.image,
    featured: course.featured,
  };
}

export function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (form.title.trim().length < 4)
    errors.title = "El título debe tener al menos 4 caracteres.";

  if (!form.categoryId) errors.categoryId = "Elegí una categoría.";

  if (!(Number(form.durationHours) > 0))
    errors.durationHours = "Debe ser mayor que 0.";

  if (!form.isFree && !(Number(form.price) > 0))
    errors.price = "Ingresá un precio o marcá gratis.";

  return errors;
}
