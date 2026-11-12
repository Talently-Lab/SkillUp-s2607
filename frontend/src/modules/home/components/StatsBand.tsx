import { Icon } from "@/shared/components/Icon";
import { STATS } from "../content";

/** White card that overlaps the bottom edge of the hero */
export function StatsBand() {
  return (
    <section className="stats-band" aria-label="SkillUp Campus en números">
      <div className="container">
        <ul className="stats" role="list">
          {STATS.map((stat) => (
            <li key={stat.label} className="stat">
              <span
                className={`stat__icon stat__icon--${stat.tone}`}
                aria-hidden="true"
              >
                <Icon name={stat.icon} />
              </span>
              <p>
                <strong className="num">
                  {stat.value}
                  {stat.suffix && <small>{stat.suffix}</small>}
                </strong>
                <span>{stat.label}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
