import { useState, type FormEvent } from "react";

import { Modal } from "@/modules/admin/components/Modal";
import { SegmentedControl } from "@/modules/admin/components/SegmentedControl";
import { toForm, validate } from "@/modules/admin/utils/formValidations";
import type { FormErrors, FormState } from "@/modules/admin/types";
import { FormField } from "@/shared/components/FormField";
import { coverOptions, levels } from "@/shared/constants/course";
import { categories } from "@/shared/mocks/courses";
import type { Course, CourseInput, CourseStatus } from "@/shared/types/course";
import "./Button.css";
import "./CourseFormModal.css";

const emptyForm: FormState = {
  title: "",
  category: categories[0],
  instructor: "",
  level: "Principiante",
  status: "draft",
  durationHours: "",
  lessons: "",
  price: "",
  isFree: false,
  image: coverOptions[0],
  featured: false,
};

type CourseFormModalProps = {
  /** null creates a new course */
  course: Course | null;
  onClose: () => void;
  onSave: (input: CourseInput) => void;
};

export function CourseFormModal({
  course,
  onClose,
  onSave,
}: CourseFormModalProps) {
  const isEdit = course !== null;
  const [form, setForm] = useState<FormState>(() =>
    course ? toForm(course) : emptyForm,
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    onSave({
      title: form.title.trim(),
      category: form.category,
      instructor: form.instructor.trim(),
      level: form.level,
      status: form.status,
      durationHours: Number(form.durationHours),
      lessons: Number(form.lessons),
      price: form.isFree ? null : Number(form.price),
      image: form.image,
      featured: form.featured,
    });
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
          >
            {isEdit ? "Guardar cambios" : "Crear curso"}
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
            value={form.category}
            onChange={(event) => set("category", event.target.value)}
          >
            {categories.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>

        <FormField
          id="course-instructor"
          label="Docente"
          placeholder="Nombre y apellido"
          required
          value={form.instructor}
          onChange={(event) => set("instructor", event.target.value)}
          error={errors.instructor}
        />

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
                  checked={form.image === src}
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
