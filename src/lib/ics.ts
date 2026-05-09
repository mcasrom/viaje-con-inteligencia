export interface IcsEvent {
  uid: string;
  startDate: string;
  endDate: string;
  summary: string;
  description?: string;
  location?: string;
  url?: string;
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function formatIcsDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatIcsDateAllDay(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0].replace(/-/g, '');
}

export function generateIcs(event: IcsEvent): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Viaje Inteligente//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeIcs(event.uid)}`,
    `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
  ];

  const useAllDay = !event.startDate.includes('T') && !event.endDate.includes('T');

  if (useAllDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatIcsDateAllDay(event.startDate)}`);
    lines.push(`DTEND;VALUE=DATE:${formatIcsDateAllDay(event.endDate)}`);
  } else {
    lines.push(`DTSTART:${formatIcsDate(event.startDate)}`);
    lines.push(`DTEND:${formatIcsDate(event.endDate)}`);
  }

  lines.push(`SUMMARY:${escapeIcs(event.summary)}`);

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeIcs(event.location)}`);
  }
  if (event.url) {
    lines.push(`URL:${escapeIcs(event.url)}`);
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}
