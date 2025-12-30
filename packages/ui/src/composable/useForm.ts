import {
  useContext,
  useEffect,
  useState,
  MutableRefObject,
  createContext,
} from "react";

export type ValidatorRule<T> = (value: T) => string | boolean | number;

export interface FormField<T = unknown> {
  el: HTMLElement;
  value: T;
  rules: Array<(value: T) => boolean | string | number>;
}

export interface FormProvider<T> {
  registerInput?: (item: FormField<T>) => void;
  unregisterInput?: (el: HTMLElement) => void;
  updateInput?: (el: HTMLElement, value: T) => void;
  updateRules?: (el: HTMLElement, rules: ValidatorRule<T>[]) => void;
}

export const FormContext = createContext<FormProvider<any> | null>(null);

const emailRegex = /\S+@\S+\.\S+/;
const passwordRegex =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,12}$/;
// const jaRegex = /^[\u30A0-\u30FF]+$/;

function detectFullWidth(value: string): boolean {
  if (!value) return false;
  return [...value].some((char) => {
    const code = char.charCodeAt(0);
    return (code >= 0x2000 && code <= 0xff60) || code >= 0xffa0;
  });
}

export type RuleType = (...args: any[]) => string | boolean | number;
export type FormRules<T extends { [key: string]: any }> = {
  [key in keyof T]: T[key] extends { [key: string]: unknown }
    ? FormRules<T[key]>
    : RuleType[];
};

const validator = {
  validate<T>(rules: ValidatorRule<T>[], value: T) {
    let error = "";
    rules.some((rule) => {
      const res = rule(value);
      if (typeof res === "string") error = res;
      return error;
    });
    return error;
  },
  validateForm<T extends object>(rules: FormRules<T>, value: T) {
    for (const key in rules) {
      if (Array.isArray(rules[key])) {
        const fieldRules = rules[key] as RuleType[];
        fieldRules.some((rule) => {
          const res = rule(value[key]);
          if (typeof res === "string") {
            const error = Error();
            error.message = `${key}: ${res}`;
            throw error;
          }
        });
      }
    }
  },
  rules: {
    required: (value: string) => value.length > 0 || "Campo Obrigatório.",
    requiredNumber: (value: number) =>
      value || value === 0 || "Campo Obrigatório.",
    requiredBoolean: (value: boolean) =>
      value === true || value === false ? value : "Campo Obrigatório.",
    email: (value: string) =>
      emailRegex.test(value) || "O campo precisa ser um email válido.",
    password: (value: string) =>
      passwordRegex.test(value) ||
      "A senha deve ter de 8 a 12 caracteres, um numero, letra maiúscula, letra minúscula e algum caractere especial.",
    max(maxValue: number | string) {
      return (value: string) => {
        if (!value) return true;
        return (
          value.length <= parseFloat(maxValue as string) ||
          `Maximo de ${maxValue} caracteres.`
        );
      };
    },
    min(minValue: number | string) {
      return (value: string) => {
        if (!value) return true;
        return (
          value.length >= parseFloat(minValue as string) ||
          `Minimo de ${minValue} caracteres.`
        );
      };
    },
    isSamePassword(password: string) {
      return (value: string) =>
        value === password || "As senhas não são iguais.";
    },
    url: (value: string) => {
      if (!value) return true;
      return (
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i.test(
          value
        ) || "URL inválida."
      );
    },
    phone: (value: string) => {
      if (!value) return true;
      const numbers = value.replace(/\D/g, "");

      if (numbers.length === 11) {
        if (numbers.startsWith("0800")) return true;
        if (numbers[2] !== "9") {
          return "O 3 digito de um número celular deve ser 9.";
        }
        return true;
      }

      return numbers.length === 10 || "Telefone inválido (10 ou 11 dígitos).";
    },
  },
};

export function useValidator() {
  return validator;
}

export function useForm<T = unknown>(
  inputRef: MutableRefObject<HTMLElement | undefined>,
  rules: ValidatorRule<T>[],
  defaultValue: T
) {
  const validator = useValidator();
  const form = useContext<FormProvider<T> | null>(FormContext);

  const [formRules, setFormRules] = useState(rules);

  const updateFormValidation = (value: T) => {
    if (form && form.updateInput && inputRef.current)
      form.updateInput(inputRef.current, value);
    return validator.validate(formRules, value);
  };

  const updateRules = (newRules: ValidatorRule<T>[]) => {
    setFormRules(newRules);
    if (form && form.updateRules && inputRef.current) {
      form.updateRules(inputRef.current, newRules);
    }
  };

  useEffect(() => {
    const currentInput = inputRef.current;
    if (form && form.registerInput && currentInput) {
      form.registerInput({ el: currentInput, value: defaultValue, rules });
    }

    return () => {
      if (form && form.unregisterInput && currentInput) {
        form.unregisterInput(currentInput);
      }
    };
  }, [form, inputRef, defaultValue, rules]);

  return {
    updateFormValidation,
    updateRules,
  };
}
