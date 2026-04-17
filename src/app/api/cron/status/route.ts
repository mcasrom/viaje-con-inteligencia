import { NextResponse } from 'next/server';

const lastCronRun: Record<string, string> = {
  'weekly-digest': 'Nunca',
  'check-alerts': 'Nunca',
};

export function updateCronTimestamp(cronName: string) {
  lastCronRun[cronName] = new Date().toISOString();
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    timestamps: {
      weekly_digest: lastCronRun['weekly-digest'],
      check_alerts: lastCronRun['check-alerts'],
      server: new Date().toISOString(),
    },
  });
}
