'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { ActionResult } from '@/lib/actions/admin';

interface ActionButtonProps {
  action: () => Promise<ActionResult>;
  label: string;
  pendingLabel?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  /** Message de confirmation avant exécution, pour les actions destructrices. */
  confirmMessage?: string;
  successMessage?: string;
}

/**
 * Déclenche une Server Action et rapporte son résultat.
 * Les erreurs sont affichées telles que le serveur les formule : l'interface
 * ne suppose jamais qu'une action a réussi.
 */
export function ActionButton({
  action,
  label,
  pendingLabel = '…',
  variant = 'secondary',
  size = 'sm',
  confirmMessage,
  successMessage,
}: ActionButtonProps) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const run = () => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        if (successMessage ?? result.message) {
          toast.push(successMessage ?? result.message ?? '', 'success');
        }
      } else {
        toast.push(result.message ?? 'Action impossible.', 'error');
      }
    });
  };

  return (
    <Button type="button" variant={variant} size={size} onClick={run} disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}
