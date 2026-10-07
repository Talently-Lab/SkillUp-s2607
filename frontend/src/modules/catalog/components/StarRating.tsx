import StarEmptyIcon from "../../../assets/icons/star-empty.svg";
import StarFilledIcon from "../../../assets/icons/star-filled.svg";
import "./StarRating.css";

type StarRatingProps = {
  value: number;
  size?: "sm" | "md";
};

/** Read-only stars with fractional fill. */
export function StarRating({ value, size = "sm" }: StarRatingProps) {
  return (
    <span
      className={`star-rating star-rating--${size}`}
      role="img"
      aria-label={`${value.toFixed(1)} de 5 estrellas`}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, value - index));
        return (
          <span key={index} className="star-rating__star">
            <img className="star-rating__icon" src={StarEmptyIcon} alt="" />
            <span
              className="star-rating__fill"
              style={{ width: `${fill * 100}%` }}
            >
              <img className="star-rating__icon" src={StarFilledIcon} alt="" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
