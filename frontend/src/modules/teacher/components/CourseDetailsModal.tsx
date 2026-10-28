import { useState, type FormEvent } from "react";

import { Modal } from "@/modules/admin/components/Modal";
import { SegmentedControl } from "@/modules/admin/components/SegmentedControl";
import { teacherErrorMessage } from "@/modules/teacher/utils/teacherErrorMessage";
import { FormField } from "@/shared/components/FormField";
import { Loader } from "@/shared/components/Loader";
import { coverOptions, levels } from "@/shared/constants/course";
import type { TeacherCourseInput } from "@/shared/services/teacherService";
import type { Category } from "@/shared/types/category";
import type { Course, CourseLevel } from "@/shared/types/course";
import "@/modules/admin/components/Button.css";
import "@/modules/admin/components/CourseFormModal.css";
import "./CourseDetailsModal.css";

const MIN_TITLE = 3;
const MAX_DESCRIPTION = 5000;

type FormState = {
  title: string;
  description: string;
  categoryId: string;
  level: CourseLevel;
  image: string;
};

/** Covers can come back from the API as absolute URLs */
const sameImage = (a: string, b: string) =>
  new URL(a, window.location.origin).href ===
  new URL(b, window.location.origin).href;

/** Only what changed, so an untouched cover doesn't get saved as the course's */
function changes(course: Course, form: FormState): Partial<TeacherCourseInput> {
  const input: Partial<TeacherCourseInput> = {};
  const title = form.title.trim();
  const description = form.description.trim() || null;
  const categoryId = Number(form.categoryId);

  if (title !== course.title) input.title = title;
  if (description !== (course.description ?? null))
    input.description = description;
  if (categoryId !== course.categoryId) input.categoryId = categoryId;
  if (form.level !== course.level) input.level = form.level;
  if (!sameImage(form.image, course.image)) input.image = form.image;

  return input;
}

type CourseDetailsModalProps = {
  course: Course;
  categories: Category[];
  onClose: () => void;
  onSave: (input: Partial<TeacherCourseInput>) => Promise<void>;
};

export function CourseDetailsModal({
  course,
  categories,
  onClose,
  onSave,
}: CourseDetailsModalProps) {
  const [form, setForm] = useState<FormState>({
    title: course.title,
    description: course.description ?? "",
    categoryId: String(course.categoryId),
    level: course.level,
    image: course.image,
  });
  const [titleError, setTitleError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Keeps the current category selectable while the list loads
  const categoryOptions = categories.some(
    (category) => category.id === course.categoryId,
  )
    ? categories
    : [
        { id: course.categoryId, name: course.category, slug: "" },
        ...categories,
      ];

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "title") setTitleError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    setFormError(null);
    if (form.title.trim().length < MIN_TITLE) {
      setTitleError(`El título debe tener al menos ${MIN_TITLE} caracteres.`);
      return;
    }

    const input = changes(course, form);
    if (Object.keys(input).length === 0) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await onSave(input);
    } catch (error) {
      setFormError(teacherErrorMessage(error));
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title="Editar datos del curso"
      description="Precio y destacados los gestiona el equipo académico."
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
            form="course-details-form"
            className="admin-button admin-button--primary"
            disabled={isSaving}
          >
            {isSaving && <Loader size={16} />}
            {isSaving ? "Guardando…" : "Guardar cambios"}
          </button>
        </>
      }
    >
      <form
        id="course-details-form"
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
            id="course-details-title"
            label="Título del curso"
            autoFocus
            required
            maxLength={255}
            value={form.title}
            onChange={(event) => set("title", event.target.value)}
            error={titleError ?? undefined}
          />
        </div>

        <div className="course-form__wide">
          <label
            htmlFor="course-details-description"
            className="course-form__label"
          >
            Descripción
          </label>
          <textarea
            id="course-details-description"
            className="course-form__textarea"
            rows={4}
            maxLength={MAX_DESCRIPTION}
            placeholder="Qué aprenderán los alumnos y para quién es el curso"
            value={form.description}
            onChange={(event) => set("description", event.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="course-details-category"
            className="course-form__label"
          >
            Categoría
          </label>
          <select
            id="course-details-category"
            className="course-form__select"
            value={form.categoryId}
            onChange={(event) => set("categoryId", event.target.value)}
          >
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="course-form__label">Nivel</p>
          <div className="course-form__control">
            <SegmentedControl
              name="course-details-level"
              label="Nivel"
              value={form.level}
              options={levels.map((level) => ({ value: level, label: level }))}
              onChange={(value) => set("level", value)}
            />
          </div>
        </div>

        <fieldset className="course-form__wide course-form__images">
          <legend className="course-form__label">Imagen de portada</legend>
          <div className="course-form__image-grid">
            {coverOptions.map((src, index) => (
              <label key={src} className="course-form__image">
                <input
                  type="radio"
                  name="course-details-image"
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
      </form>
    </Modal>
  );
}
