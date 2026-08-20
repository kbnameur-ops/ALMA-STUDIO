'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { site } from '@/config/site';

interface AddToCalendarProps {
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  description: string;
  reference: string;
}

/** Format `YYYYMMDDTHHMMSSZ` attendu par le standard iCalendar. */
function toIcsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeIcs(value: string): string {
  return value.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
}

/**
 * Génère un fichier .ics côté navigateur : pas d'aller-retour serveur pour
 * une donnée que la page possède déjà.
 */
export function AddToCalendar(props: AddToCalendarProps) {
  const [error, setError] = useState<string | null>(null);

  const download = () => {
    try {
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        `PRODID:-//${site.brandName}//Reservation//FR`,
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:${props.reference}@alma-studio`,
        `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
        `DTSTART:${toIcsDate(props.startsAt)}`,
        `DTEND:${toIcsDate(props.endsAt)}`,
        `SUMMARY:${escapeIcs(props.title)}`,
        `LOCATION:${escapeIcs(props.location)}`,
        `DESCRIPTION:${escapeIcs(props.description)}`,
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alma-${props.reference}.ics`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('Téléchargement impossible sur cet appareil.');
    }
  };

  return (
    <div>
      <Button type="button" variant="secondary" onClick={download}>
        Ajouter au calendrier
      </Button>
      {error && (
        <p role="alert" className="mt-2 font-body text-xs text-terracotta">
          {error}
        </p>
      )}
    </div>
  );
}
