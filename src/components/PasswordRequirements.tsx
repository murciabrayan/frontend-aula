import { PASSWORD_REQUIREMENTS } from "@/utils/passwordValidation";

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

const PasswordRequirements = ({
  password,
  className = "",
}: PasswordRequirementsProps) => {
  return (
    <div className={`password-requirements ${className}`.trim()}>
      <span className="password-requirements__title">Tu contraseña debe incluir:</span>
      <ul className="password-requirements__list">
        {PASSWORD_REQUIREMENTS.map((requirement) => {
          const isMet = requirement.test(password);

          return (
            <li
              key={requirement.key}
              className={`password-requirements__item ${isMet ? "is-met" : ""}`}
            >
              <span className="password-requirements__check" aria-hidden="true">
                {isMet ? "✓" : "○"}
              </span>
              <span>{requirement.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordRequirements;
