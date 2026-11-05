import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Modal } from "@/modules/admin/components/Modal";
import type { StarValue } from "@/shared/types/review";
import StarEmptyIcon from "@/assets/icons/star-empty.svg";
import StarFilledIcon from "@/assets/icons/star-filled.svg";
import "@/modules/admin/components/Button.css";
import "./ReviewFormModal.css";

const RATINGS: StarValue[] = [1, 2, 3, 4, 5];
const MAX_COMMENT_LENGTH = 500;

type ReviewFormErrors = { rating?: string; comment?: string };

type ReviewFormModalProps = {
  courseTitle: string;
  onClose: () => void;
};

export function ReviewFormModal({
  courseTitle,
  onClose,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState<StarValue | null>(null);
  const [hovered, setHovered] = useState<StarValue | null>(null);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<ReviewFormErrors>({});
  const shownRating = hovered ?? rating ?? 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: ReviewFormErrors = {};
    if (!rating) nextErrors.rating = "Elige una valoración.";
    if (!comment.trim()) nextErrors.comment = "Escribe tu comentario.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    // TODO: enviar la reseña a la API cuando exista el endpoint, hoy no se guarda
    toast.info(
      "¡Gracias por tu opinión! Muy pronto podrás publicar tus reseñas.",
    );
    onClose();
  };

  return (
    <Modal
      size="sm"
      title="Dejar reseña"
      description={courseTitle}
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
            form="review-form"
            className="admin-button admin-button--primary"
          >
            Enviar reseña
          </button>
        </>
      }
    >
      <form
        id="review-form"
        className="review-form"
        noValidate
        onSubmit={handleSubmit}
      >
        <fieldset className="review-form__rating">
          <legend className="review-form__label">Tu valoración</legend>
          <div
            className="review-form__stars"
            onMouseLeave={() => setHovered(null)}
          >
            {RATINGS.map((value) => (
              <label
                key={value}
                className="review-form__star"
                onMouseEnter={() => setHovered(value)}
              >
                <input
                  type="radio"
                  name="review-rating"
                  className="visually-hidden"
                  checked={rating === value}
                  onChange={() => {
                    setRating(value);
                    setErrors((prev) => ({ ...prev, rating: undefined }));
                  }}
                />
                <img
                  className="review-form__star-icon"
                  src={value <= shownRating ? StarFilledIcon : StarEmptyIcon}
                  alt=""
                />
                <span className="visually-hidden">
                  {value} {value === 1 ? "estrella" : "estrellas"}
                </span>
              </label>
            ))}
          </div>
          {errors.rating && (
            <p className="review-form__error" role="alert">
              {errors.rating}
            </p>
          )}
        </fieldset>

        <div>
          <label htmlFor="review-comment" className="review-form__label">
            Tu comentario
          </label>
          <textarea
            id="review-comment"
            className="review-form__textarea"
            rows={4}
            maxLength={MAX_COMMENT_LENGTH}
            placeholder="¿Qué te pareció el curso?"
            value={comment}
            aria-invalid={Boolean(errors.comment)}
            onChange={(event) => {
              setComment(event.target.value);
              setErrors((prev) => ({ ...prev, comment: undefined }));
            }}
          />
          {errors.comment && (
            <p className="review-form__error" role="alert">
              {errors.comment}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
