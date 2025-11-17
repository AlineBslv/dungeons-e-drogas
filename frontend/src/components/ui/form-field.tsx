import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";
import { Input } from "./input";

export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export type ValidationStatus = "idle" | "valid" | "invalid" | "warning";

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  validationRules?: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showValidIcon?: boolean;
  required?: boolean;
}

/**
 * FormField com validação inline
 * Segue padrões WCAG 2.1 Level AA
 *
 * Features:
 * - Validação em tempo real (onChange)
 * - Validação ao sair do campo (onBlur)
 * - Feedback visual (cores, ícones)
 * - Mensagens de erro acessíveis (aria-describedby, role="alert")
 * - Touch target mínimo 44px
 */
const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      id,
      error,
      success,
      warning,
      helperText,
      validationRules = [],
      validateOnChange = true,
      validateOnBlur = true,
      showValidIcon = true,
      required = false,
      className,
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [validationStatus, setValidationStatus] = React.useState<ValidationStatus>("idle");
    const [validationMessage, setValidationMessage] = React.useState<string>("");
    const [touched, setTouched] = React.useState(false);

    // Determina o status final (props externas têm prioridade)
    const finalStatus: ValidationStatus = error
      ? "invalid"
      : success
      ? "valid"
      : warning
      ? "warning"
      : validationStatus;

    const finalMessage = error || success || warning || validationMessage || helperText;

    // Validação
    const runValidation = (value: string) => {
      if (!validationRules || validationRules.length === 0) return;

      for (const rule of validationRules) {
        if (!rule.validate(value)) {
          setValidationStatus("invalid");
          setValidationMessage(rule.message);
          return;
        }
      }

      setValidationStatus("valid");
      setValidationMessage("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (validateOnChange && touched) {
        runValidation(e.target.value);
      }
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      if (validateOnBlur) {
        runValidation(e.target.value);
      }
      onBlur?.(e);
    };

    // IDs para acessibilidade
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const describedBy = [
      finalStatus === "invalid" && errorId,
      (helperText || finalMessage) && helperId,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="space-y-2">
        {/* Label */}
        <Label htmlFor={id} className="flex items-center gap-1">
          {label}
          {required && (
            <span className="text-red-500" aria-label="campo obrigatório">
              *
            </span>
          )}
        </Label>

        {/* Input com ícone de validação */}
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            className={cn(
              // Estados de validação
              {
                "border-green-500 focus-visible:ring-green-500":
                  finalStatus === "valid" && touched,
                "border-red-500 focus-visible:ring-red-500 pr-10":
                  finalStatus === "invalid" && touched,
                "border-yellow-500 focus-visible:ring-yellow-500":
                  finalStatus === "warning" && touched,
              },
              className
            )}
            aria-invalid={finalStatus === "invalid"}
            aria-describedby={describedBy || undefined}
            aria-required={required}
            onChange={handleChange}
            onBlur={handleBlur}
            {...props}
          />

          {/* Ícone de validação */}
          {showValidIcon && touched && finalStatus !== "idle" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {finalStatus === "valid" && (
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {finalStatus === "invalid" && (
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              {finalStatus === "warning" && (
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* Mensagem de feedback */}
        {finalMessage && (
          <p
            id={finalStatus === "invalid" ? errorId : helperId}
            className={cn("text-sm flex items-start gap-1", {
              "text-red-500": finalStatus === "invalid",
              "text-green-500": finalStatus === "valid",
              "text-yellow-500": finalStatus === "warning",
              "text-muted-foreground": finalStatus === "idle",
            })}
            role={finalStatus === "invalid" ? "alert" : undefined}
            aria-live={finalStatus === "invalid" ? "assertive" : "polite"}
          >
            {finalStatus === "invalid" && <span aria-hidden="true">⚠</span>}
            {finalStatus === "valid" && <span aria-hidden="true">✓</span>}
            {finalStatus === "warning" && <span aria-hidden="true">⚠</span>}
            {finalMessage}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };

/**
 * Validation helpers
 */
export const validationHelpers = {
  required: (message = "Este campo é obrigatório"): ValidationRule => ({
    validate: (value) => value.trim().length > 0,
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => value.length >= min,
    message: message || `Mínimo de ${min} caracteres`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => value.length <= max,
    message: message || `Máximo de ${max} caracteres`,
  }),

  email: (message = "Email inválido"): ValidationRule => ({
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  password: (message = "Senha deve ter pelo menos 8 caracteres, incluindo letra e número"): ValidationRule => ({
    validate: (value) => {
      const hasMinLength = value.length >= 8;
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      return hasMinLength && hasLetter && hasNumber;
    },
    message,
  }),

  url: (message = "URL inválida"): ValidationRule => ({
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  pattern: (pattern: RegExp, message = "Formato inválido"): ValidationRule => ({
    validate: (value) => pattern.test(value),
    message,
  }),

  custom: (validateFn: (value: string) => boolean, message: string): ValidationRule => ({
    validate: validateFn,
    message,
  }),
};
