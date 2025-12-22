import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';

import { useValidator } from './composable/useForm';
export { useValidator } from './composable/useForm';

// Types
export type ValidatorRule<T> = ((value: T) => string | boolean | number)[];
export type RuleType = (...args: (unknown)[]) => string | boolean;
export type FormRules<T extends { [key: string]: any }> = {
  [key in keyof T]: T[key] extends { [key: string]: unknown } ? FormRules<T[key]> : RuleType[];
};

export interface FormField<T = unknown> {
  value: T;
  rules: ValidatorRule<T>;
}

export interface FormFieldRef<T = unknown> extends FormField<T> {
  id: number;
  ignoreRequired?: boolean;
  setError: (error: string) => void;
  validate: () => void;
}

export interface FormProvider {
  registerInput: (item: Omit<FormFieldRef, 'id'>) => number;
  unregisterInput: (id: number) => void;
  updateInput: (id: number, value: unknown, rules: ValidatorRule<unknown>) => void;
}

const FormContext = createContext<FormProvider | null>(null);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

export default function useForm() {
  const [isValid, setIsValid] = useState(false);
  const fields = useRef<FormFieldRef[]>([]);
  const validator = useValidator();

  const checkValidity = useCallback(() => {
    const isFormValid = !fields.current.some(
      (item) => !item.ignoreRequired && validator.validate(item.rules, item.value)
    );
    setIsValid(isFormValid);
    return isFormValid;
  }, [validator]);

  const validateAll = useCallback(() => {
    const isFormValid = checkValidity();
    return isFormValid;
  }, [checkValidity]);

  const registerInput = useCallback((formField: Omit<FormFieldRef, 'id'>): number => {
    const lastItem = fields.current[fields.current.length - 1];
    const id = lastItem ? lastItem.id + 1 : 1;
    const newItem: FormFieldRef = {
      id,
      ...formField,
    };
    fields.current.push(newItem);
    return id;
  }, []);

  const unregisterInput = useCallback((id: number) => {
    const idx = fields.current.findIndex((item) => item.id === id);
    if (idx === -1) return;
    fields.current.splice(idx, 1);
    checkValidity();
  }, [checkValidity]);

  const updateInput = useCallback((id: number, value: unknown, rules: ValidatorRule<unknown>) => {
    const field = fields.current.find((item) => item.id === id);
    if (field) {
      field.value = value;
      field.rules = rules as ValidatorRule<any>;
    }
    checkValidity();
  }, [checkValidity]);

  const formProvider = useMemo((): FormProvider => ({
    registerInput,
    unregisterInput,
    updateInput,
  }), [registerInput, unregisterInput, updateInput]);

  const FormProviderComponent = useCallback(({ children }: { children: React.ReactNode }) => (
    <FormContext.Provider value={formProvider}>
      {children}
    </FormContext.Provider>
  ), [formProvider]);

  const triggerAllValidations = useCallback(() => {
    fields.current.forEach(field => field.validate());
    const isFormValid = validateAll();
    if (!isFormValid) {
      setTimeout(() => {
        if (typeof document !== 'undefined') {
          const elements = document.querySelectorAll('.invalidField');
          if (elements.length) {
            const firstElement = elements[0];
            if (firstElement instanceof HTMLElement) {
              firstElement.focus({ preventScroll: true });
              firstElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }
          }
        }
      }, 0);
    }
    return isFormValid;
  }, [validateAll]);

  return {
    isValid,
    FormProvider: FormProviderComponent,
    validateAll: triggerAllValidations,
  };
}

export function useFormField<T>(value: T, rules: ValidatorRule<T>, disableRequired?: boolean) {
  const { registerInput, unregisterInput, updateInput } = useFormContext();
  const [error, setError] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const validator = useValidator();
  const idRef = useRef<number | null>(null);
  const isFirstRender = useRef(true);

  const validate = useCallback(() => {
    const errorMessage = validator.validate(rules, value);
    setError(errorMessage);
    return !errorMessage;
  }, [rules, value, validator]);

  const onBlur = useCallback(() => {
    setIsTouched(true);
    validate();
  }, [validate]);

  useEffect(() => {
    const field = {
      value,
      rules,
      setError,
      validate,
      ignoreRequired: disableRequired,
    };
    const id = registerInput(field as Omit<FormFieldRef<unknown>, 'id'>);
    idRef.current = id;

    return () => {
      unregisterInput(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerInput, unregisterInput]);

  useEffect(() => {
    if (idRef.current !== null) {
      updateInput(idRef.current, value, rules as ValidatorRule<unknown>);
    }
  }, [value, rules, updateInput]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only validate automatically if the field has been touched
    if (isTouched) {
      validate();
    }
  }, [value, validate, isTouched]);

  return {
    error,
    validate,
    onBlur,
  };
}
