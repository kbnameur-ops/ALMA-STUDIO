'use client';

import { useRef, useTransition, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { ActionResult } from '@/lib/actions/admin';

interface ActionFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  children: ReactNode;
  /** Vide les champs après un enregistrement réussi (formulaires de création). */
  resetOnSuccess?: boolean;
}

/** Formulaire relié à une Server Action, avec retour utilisateur immédiat. */
export function ActionForm({
  action,
  submitLabel,
  children,
  resetOnSuccess = false,
}: ActionFormProps) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await action(formData);
          if (result.ok) {
            toast.push(result.message ?? 'Enregistré.', 'success');
            if (resetOnSuccess) formRef.current?.reset();
          } else {
            toast.push(result.message ?? 'Enregistrement impossible.', 'error');
          }
        });
      }}
      className="space-y-5"
    >
      {children}
      <Button type="submit" disabled={pending}>
        {pending ? 'Enregistrement…' : submitLabel}
      </Button>
    </form>
  );
}
