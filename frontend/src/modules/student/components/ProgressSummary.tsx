import "./ProgressSummary.css";

type ProgressSummaryProps = {
  completedLessons: number;
  hoursLearned: number;
};

export function ProgressSummary({
  completedLessons,
  hoursLearned,
}: ProgressSummaryProps) {
  return (
    <section aria-labelledby="summary-heading">
      <h2 id="summary-heading" className="progress-summary__title">
        Tu avance
      </h2>
      <dl className="progress-summary">
        <div className="progress-summary__item">
          <dt className="progress-summary__label">Lecciones completadas</dt>
          <dd className="progress-summary__value">{completedLessons}</dd>
        </div>
        <div className="progress-summary__item">
          <dt className="progress-summary__label">Horas de estudio</dt>
          <dd className="progress-summary__value">
            {Math.round(hoursLearned)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
