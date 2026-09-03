import { NextResponse } from 'next/server';

/** Réponses JSON normalisées pour les route handlers. */

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export interface ApiErrorBody {
  error: string;
  /** Code machine, destiné à l'affichage d'un message adapté côté client. */
  code?: string;
  /** Erreurs de validation, indexées par champ. */
  fields?: Record<string, string>;
}

export function jsonError(
  message: string,
  status: number,
  extra?: Omit<ApiErrorBody, 'error'>,
): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function tooManyRequests(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: 'Trop de tentatives. Merci de réessayer dans un instant.', code: 'RATE_LIMITED' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}
