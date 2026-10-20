import { useState, type FormEvent } from "react";

import { Modal } from "@/modules/admin/components/Modal";
import { SegmentedControl } from "@/modules/admin/components/SegmentedControl";
import { courseErrorMessage } from "@/modules/admin/utils/courseErrorMessage";
import { toForm, validate } from "@/modules/admin/utils/formValidations";
import type { FormErrors, FormState } from "@/modules/admin/types";
import { ApiError } from "@/shared/api/http";
import { FormField } from "@/shared/components/FormField";
import { Loader } from "@/shared/components/Loader";
import { coverOptions, levels } from "@/shared/constants/course";
import type { Teacher } from "@/shared/services/adminUsersService";
import type { Category } from "@/shared/types/category";
import type { Course, CourseInput, CourseStatus } from "@/shared/types/course";
import "./Button.css";
import "./CourseFormModal.css";

const emptyForm = (categories: Category[]): FormState => ({
  title: "",
  categoryId: categories[0] ? String(categories[0].id) : "",
  instructorId: "",
  level: "Principiante",
  status: "draft",
  durationHours: "",
  lessons: "",
  price: "",
  isFree: false,
  image: coverOptions[0],
  featured: false,
});

/** Covers can come back from the API as absolute URLs */
const sameImage = (a: string, b: string) =>
  new URL(a, window.location.origin).href ===
  new URL(b, window.location.origin).href;

type CourseFormModalProps = {
  /** null creates a new course */
  course: Course | null;
  categories: Category[];
  teachers: Teacher[];
  onClose: () => void;
  /** Rejects with the API error, which is shown in the form */
  onSave: (input: CourseInput) => Promise<void>;
};

export function CourseFormModal({
  course,
  categories,
  teachers,
  onClose,
  onSave,
}: CourseFormModalProps) {
  const isEdit = course !== null;
  const [form, setForm] = useState<FormState>(() =>
    course ? toForm(course) : emptyForm(categories),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Keeps the current teacher selectable if they are not in the list
  const teacherOptions =
    course?.instructorId &&
    !teachers.some((teacher) => teacher.id === course.instructorId)
      ? [...teachers, { id: course.instructorId, name: course.instructor }]
      : teachers;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    const next = validate(form);
    setErrors(next);
    setFormError(null);
    if (Object.values(next).some(Boolean)) return;

    setIsSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        categoryId: Number(form.categoryId),
        instructorId: form.instructorId || null,
        level: form.level,
        status: form.status,
        durationHours: Number(form.durationHours),
        lessons: Number(form.lessons),
        price: form.isFree ? null : Number(form.price),
        image: form.image,
        featured: form.featured,
      });
    } catch (error) {
      if (error instanceof ApiError && error.code === "SLUG_TAKEN")
        setErrors({ title: courseErrorMessage(error) });
      else setFormError(courseErrorMessage(error));
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar curso" : "Crear curso"}
      description={
        isEdit
          ? "Los cambios se aplican al instante."
          : "Completa los datos básicos. Podrás editarlo después."
      }
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="admin-button admin-button--secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="course-form"
            className="admin-button admin-button--primary"
            disabled={isSaving}
          >
            {isSaving && <Loader size={16} />}
            {isSaving
              ? "Guardando…"
              : isEdit
                ? "Guardar cambios"
                : "Crear curso"}
          </button>
        </>
      }
    >
      <form
        id="course-form"
        className="course-form"
        noValidate
        onSubmit={handleSubmit}
      >
        {formError && (
          <p className="course-form__wide course-form__error" role="alert">
            {formError}
          </p>
        )}

        <div className="course-form__wide">
          <FormField
            id="course-title"
            label="Título del curso"
            placeholder="Ej. Introducción a la ciencia de datos"
            autoFocus
            required
            value={form.title}
            onChange={(event) => set("title", event.target.value)}
            error={errors.title}
          />
        </div>

        <div>
          <label htmlFor="course-form-category" className="course-form__label">
            Categoría
          </label>
          <select
            id="course-form-category"
            className="course-form__select"
            value={form.categoryId}
            onChange={(event) => set("categoryId", event.target.value)}
            aria-invalid={Boolean(errors.categoryId)}
            aria-describedby={
              errors.categoryId ? "course-form-category-error" : undefined
            }
          >
            {categories.length === 0 && (
              <option value="">No hay categorías disponibles</option>
            )}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p
              id="course-form-category-error"
              className="course-form__field-error"
            >
              {errors.categoryId}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="course-form-teacher" className="course-form__label">
            Docente
          </label>
          <select
            id="course-form-teacher"
            className="course-form__select"
            value={form.instructorId}
            onChange={(event) => set("instructorId", event.target.value)}
          >
            <option value="">Sin asignar</option>
            {teacherOptions.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="course-form__label">Nivel</p>
          <div className="course-form__control">
            <SegmentedControl
              name="course-level"
              label="Nivel"
              value={form.level}
              options={levels.map((level) => ({ value: level, label: level }))}
              onChange={(value) => set("level", value)}
            />
          </div>
        </div>

        <div>
          <p className="course-form__label">Estado</p>
          <div className="course-form__control">
            <SegmentedControl<CourseStatus>
              name="course-status"
              label="Estado"
              value={form.status}
              options={[
                { value: "published", label: "Publicado" },
                { value: "draft", label: "Borrador" },
              ]}
              onChange={(value) => set("status", value)}
            />
          </div>
        </div>

        <div className="course-form__wide course-form__numbers">
          <FormField
            id="course-duration"
            label="Duración (h)"
            type="number"
            min={1}
            inputMode="numeric"
            required
            value={form.durationHours}
            onChange={(event) => set("durationHours", event.target.value)}
            error={errors.durationHours}
          />
          <FormField
            id="course-lessons"
            label="Lecciones"
            type="number"
            min={1}
            inputMode="numeric"
            required
            value={form.lessons}
            onChange={(event) => set("lessons", event.target.value)}
            error={errors.lessons}
          />
          <FormField
            id="course-price"
            label="Precio (US$)"
            type="number"
            min={0}
            inputMode="decimal"
            placeholder={form.isFree ? "Gratis" : "0"}
            disabled={form.isFree}
            value={form.isFree ? "" : form.price}
            onChange={(event) => set("price", event.target.value)}
            error={errors.price}
            labelAction={
              <label className="course-form__free">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(event) => {
                    set("isFree", event.target.checked);
                    setErrors((prev) => ({ ...prev, price: undefined }));
                  }}
                />
                Gratis
              </label>
            }
          />
        </div>

        <fieldset className="course-form__wide course-form__images">
          <legend className="course-form__label">Imagen de portada</legend>
          <div className="course-form__image-grid">
            {coverOptions.map((src, index) => (
              <label key={src} className="course-form__image">
                <input
                  type="radio"
                  name="course-image"
                  className="visually-hidden"
                  checked={sameImage(form.image, src)}
                  onChange={() => set("image", src)}
                  aria-label={`Imagen ${index + 1}`}
                />
                <img src={src} alt="" />
              </label>
            ))}
          </div>
        </fieldset>

        <label className="course-form__wide course-form__featured">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => set("featured", event.target.checked)}
          />
          <span>
            <span className="course-form__featured-title">
              Destacar en la página de inicio
            </span>
            <span className="course-form__featured-hint">
              Aparece entre los cursos destacados del inicio.
            </span>
          </span>
        </label>
      </form>
    </Modal>
  );
}
