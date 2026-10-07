import ChevronLeftIcon from "../../../assets/icons/chevron-left.svg";
import ChevronRightIcon from "../../../assets/icons/chevron-right.svg";
import "./Pagination.css";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label: string;
};

export function Pagination({
  page,
  totalPages,
  onPageChange,
  label,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination" aria-label={label}>
      <button
        type="button"
        className="pagination__btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        <img className="pagination__icon" src={ChevronLeftIcon} alt="" />
      </button>
      <ul className="pagination__pages">
        {pages.map((number) => (
          <li key={number}>
            <button
              type="button"
              className={
                number === page
                  ? "pagination__btn pagination__btn--active"
                  : "pagination__btn"
              }
              onClick={() => onPageChange(number)}
              aria-current={number === page ? "page" : undefined}
              aria-label={`Página ${number}`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="pagination__btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Página siguiente"
      >
        <img className="pagination__icon" src={ChevronRightIcon} alt="" />
      </button>
    </nav>
  );
}
