'use client';

import { useId } from 'react';
import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

const controlClass =
  'w-full rounded-md border border-[color:var(--color-line-strong)] bg-ink px-4 py-3 ' +
  'font-body text-sm text-ivory placeholder:text-ivory-55/70 ' +
  'transition-colors duration-200 hover:border-ivory/40 ' +
  'focus:border-terracotta focus:outline-none focus-visible:outline-none ' +
  'aria-[invalid=true]:border-terracotta';

interface WrapperProps {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  hint?: string | undefined;
  required?: boolean;
  children: ReactNode;
}

function FieldWrapper({ label, htmlFor, error, hint, required, children }: WrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-body text-[0.7rem] uppercase tracking-[0.16em] text-ivory-70"
      >
        {label}
        {required && (
          <span className="ml-1 text-terracotta" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="font-body text-xs text-ivory-55">{hint}</p>}
      {error && (
        <p role="alert" className="font-body text-xs text-terracotta">
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
};

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy = error ? `${fieldId}-error` : undefined;

  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error} hint={hint} required={props.required}>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(controlClass, className)}
        {...props}
      />
    </FieldWrapper>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
};

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error} hint={hint} required={props.required}>
      <textarea
        id={fieldId}
        rows={props.rows ?? 4}
        aria-invalid={error ? true : undefined}
        className={cn(controlClass, 'resize-y', className)}
        {...props}
      />
    </FieldWrapper>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: ReactNode;
};

export function Select({ label, error, hint, className, id, children, ...props }: SelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error} hint={hint} required={props.required}>
      <select
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(controlClass, 'appearance-none pr-10', className)}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** Texte de la case. Volontairement `string` : voir `hint`. */
  label: string;
  /**
   * Complément affiché sous la case — c'est là que doivent vivre les liens.
   * Un lien placé *dans* un `<label>` déclenche à la fois la navigation et
   * la bascule de la case : le visiteur coche sans le vouloir, ou l'inverse.
   */
  hint?: ReactNode;
  error?: string | undefined;
};

export function Checkbox({ label, hint, error, className, id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="flex items-start gap-3">
      <input
        id={fieldId}
        type="checkbox"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(
          'mt-1 h-4 w-4 shrink-0 cursor-pointer rounded-xs border border-[color:var(--color-line-strong)]',
          'accent-[color:var(--color-terracotta)]',
          className,
        )}
        {...props}
      />
      <div className="flex flex-col gap-1">
        <label
          htmlFor={fieldId}
          className="cursor-pointer font-body text-sm leading-relaxed text-ivory-70"
        >
          {label}
        </label>
        {hint && <div className="font-body text-xs text-ivory-55">{hint}</div>}
        {error && (
          <p id={`${fieldId}-error`} role="alert" className="font-body text-xs text-terracotta">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
