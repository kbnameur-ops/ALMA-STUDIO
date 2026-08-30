'use client';

import { useState } from 'react';
import { site } from '@/config/site';
import { Input } from '@/components/forms/Field';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { AddressInput } from '@/lib/validation/booking';
import type { Cents, LocationKind, Service } from '@/types';

interface LocationStepProps {
  service: Service;
  locationKind: LocationKind;
  address: AddressInput | null;
  zoneName: string | null;
  travelFeeCents: Cents;
  onSelectKind: (kind: LocationKind) => void;
  onAddressConfirmed: (
    address: AddressInput | null,
    travelFeeCents: Cents,
    zoneName: string | null,
  ) => void;
}

/**
 * Étape 3 — le studio est l'option principale ; le domicile reste
 * secondaire et conditionné à la zone desservie, vérifiée côté serveur.
 */
export function LocationStep({
  service,
  locationKind,
  address,
  zoneName,
  travelFeeCents,
  onSelectKind,
  onAddressConfirmed,
}: LocationStepProps) {
  const [line1, setLine1] = useState(address?.line1 ?? '');
  const [line2, setLine2] = useState(address?.line2 ?? '');
  const [postalCode, setPostalCode] = useState(address?.postalCode ?? '');
  const [city, setCity] = useState(address?.city ?? 'Paris');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const homeAvailable = site.homeServiceEnabled && service.homeServiceAvailable;

  const checkAddress = async () => {
    setError(null);

    if (line1.trim().length < 3 || city.trim().length < 2) {
      setError('Merci d’indiquer une adresse complète.');
      return;
    }
    if (!/^\d{5}$/.test(postalCode.trim())) {
      setError('Le code postal doit comporter 5 chiffres.');
      return;
    }

    setChecking(true);
    try {
      const response = await fetch('/api/zones/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postalCode: postalCode.trim() }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof payload === 'object' && payload && 'error' in payload
            ? String((payload as { error: unknown }).error)
            : 'Adresse non desservie.';
        setError(message);
        onAddressConfirmed(null, 0, null);
        return;
      }

      const zone = payload as { zoneName: string; travelFeeCents: number };
      onAddressConfirmed(
        {
          line1: line1.trim(),
          line2: line2.trim() || null,
          postalCode: postalCode.trim(),
          city: city.trim(),
        },
        zone.travelFeeCents,
        zone.zoneName,
      );
    } catch {
      setError('Vérification impossible pour le moment. Merci de réessayer.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="sr-only">Choisir le lieu de la séance</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={cn(
              'cursor-pointer rounded-lg border p-5 transition-all duration-300',
              locationKind === 'studio'
                ? 'border-terracotta bg-terracotta/6'
                : 'border-[color:var(--color-line)] hover:border-ivory/30',
            )}
          >
            <input
              type="radio"
              name="lieu"
              value="studio"
              checked={locationKind === 'studio'}
              onChange={() => onSelectKind('studio')}
              className="sr-only"
            />
            <span className="font-heading text-xl font-light">Au studio</span>
            <span className="mt-1 block font-body text-xs text-ivory-55">Option principale</span>
            <span className="mt-3 block font-body text-sm leading-relaxed text-ivory-70">
              Un espace privé à {site.businessAddress.city}, préparé avant chaque arrivée.{' '}
              {site.studioLocationNote}
            </span>
          </label>

          <label
            className={cn(
              'rounded-lg border p-5 transition-all duration-300',
              !homeAvailable && 'cursor-not-allowed opacity-55',
              homeAvailable && 'cursor-pointer',
              locationKind === 'home'
                ? 'border-terracotta bg-terracotta/6'
                : 'border-[color:var(--color-line)] hover:border-ivory/30',
            )}
          >
            <input
              type="radio"
              name="lieu"
              value="home"
              disabled={!homeAvailable}
              checked={locationKind === 'home'}
              onChange={() => onSelectKind('home')}
              className="sr-only"
            />
            <span className="font-heading text-xl font-light">À domicile</span>
            <span className="mt-1 block font-body text-xs text-ivory-55">
              {homeAvailable ? 'Selon zone et disponibilités' : 'Non proposé pour cette prestation'}
            </span>
            <span className="mt-3 block font-body text-sm leading-relaxed text-ivory-70">
              Certaines prestations sont disponibles à domicile selon votre adresse et nos créneaux.
              Des frais de déplacement s’appliquent.
            </span>
          </label>
        </div>
      </fieldset>

      {locationKind === 'home' && homeAvailable && (
        <div className="rounded-lg border border-[color:var(--color-line)] bg-ink-raised p-5 sm:p-6">
          <h3 className="font-body text-[0.7rem] uppercase tracking-[0.2em] text-champagne">
            Votre adresse
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Adresse"
                value={line1}
                onChange={(event) => setLine1(event.target.value)}
                autoComplete="address-line1"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Complément"
                value={line2}
                onChange={(event) => setLine2(event.target.value)}
                autoComplete="address-line2"
                hint="Étage, code, interphone"
              />
            </div>
            <Input
              label="Code postal"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              required
            />
            <Input
              label="Ville"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              autoComplete="address-level2"
              required
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Button type="button" variant="secondary" size="sm" onClick={checkAddress} disabled={checking}>
              {checking ? 'Vérification…' : 'Vérifier la zone'}
            </Button>

            {zoneName && !error && (
              <p className="font-body text-sm text-sage">
                Zone {zoneName} · déplacement {formatPrice(travelFeeCents)}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-3 font-body text-sm text-terracotta">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
