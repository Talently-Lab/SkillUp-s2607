import type { AccountType } from "../types/account";
import GraduationCapIcon from "../../assets/icons/graduation-cap.svg";
import PresentationIcon from "../../assets/icons/presentation.svg";
import "./AccountTypeToggle.css";

type AccountTypeToggleProps = {
  value: AccountType;
  onChange: (value: AccountType) => void;
  options?: AccountType[];
};

const accountTypeMeta: Record<AccountType, { label: string; icon?: string }> = {
  student: { label: "Alumno", icon: GraduationCapIcon },
  teacher: { label: "Docente", icon: PresentationIcon },
  admin: { label: "Administrador" },
};

export function AccountTypeToggle({
  value,
  onChange,
  options = ["student", "teacher", "admin"],
}: AccountTypeToggleProps) {
  return (
    <fieldset className="account-type-toggle">
      <legend className="visually-hidden">Tipo de cuenta</legend>
      <div
        className="account-type-toggle__options"
        style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      >
        {options.map((option) => {
          const { label, icon } = accountTypeMeta[option];
          const isActive = option === value;

          return (
            <label
              key={option}
              className={
                isActive
                  ? "account-type-toggle__option account-type-toggle__option--active"
                  : "account-type-toggle__option"
              }
            >
              <input
                className="visually-hidden"
                type="radio"
                name="account-type"
                value={option}
                checked={isActive}
                onChange={() => onChange(option)}
              />
              {icon && (
                <img className="account-type-toggle__icon" src={icon} alt="" />
              )}
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
