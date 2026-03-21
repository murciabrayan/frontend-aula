export interface PasswordRequirement {
  key: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    key: "length",
    label: "Minimo 8 caracteres",
    test: (value) => value.length >= 8,
  },
  {
    key: "uppercase",
    label: "Al menos una mayuscula",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    key: "number",
    label: "Al menos un numero",
    test: (value) => /\d/.test(value),
  },
  {
    key: "special",
    label: "Al menos un caracter especial",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export const isStrongPassword = (value: string) =>
  PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(value));

