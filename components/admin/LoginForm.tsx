'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Field';
import { getBrowserClient } from '@/lib/supabase/client';

/**
 * Connexion au back-office.
 *
 * L'authentification passe par Supabase Auth ; l'autorisation réelle est
 * vérifiée côté serveur au chargement de chaque page d'administration.
 */
export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const client = getBrowserClient();
    if (!client) {
      setError('L’authentification n’est pas configurée sur cet environnement.');
      setSubmitting(false);
      return;
    }

    const { error: authError } = await client.auth.signInWithPassword({ email, password });

    if (authError) {
      // Message volontairement générique : ne pas révéler l'existence d'un compte.
      setError('Identifiants incorrects.');
      setSubmitting(false);
      return;
    }

    router.replace(next);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="username"
        required
      />
      <Input
        label="Mot de passe"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
      />

      {error && (
        <p role="alert" className="font-body text-sm text-terracotta">
          {error}
        </p>
      )}

      <Button type="submit" fullWidth size="lg" disabled={submitting}>
        {submitting ? 'Connexion…' : 'Se connecter'}
      </Button>
    </form>
  );
}
