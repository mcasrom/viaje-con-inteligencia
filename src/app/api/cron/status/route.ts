import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface CronStatus {
  scrapeMaec: {
    lastRun: string | null;
    nextRun: string | null;
    status: 'healthy' | 'warning' | 'error' | 'pending';
  };
  checkAlerts: {
    lastRun: string | null;
    nextRun: string | null;
    status: 'healthy' | 'warning' | 'error' | 'pending';
  };
  weeklyDigest: {
    lastRun: string | null;
    nextRun: string | null;
    status: 'healthy' | 'warning' | 'error' | 'pending';
  };
  overall: 'healthy' | 'warning' | 'error' | 'pending';
  currentTime: string;
  nextScheduled: string;
}

function getNextCronTime(lastRun: string | null): string | null {
  if (!lastRun) return null;
  
  const now = new Date();
  const last = new Date(lastRun);
  const hoursDiff = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
  
  const next = new Date(last);
  next.setDate(next.getDate() + 1);
  next.setHours(6, 0, 0, 0);
  
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next.toISOString();
}

function calculateStatus(lastRun: string | null, expectedHoursAgo: number): 'healthy' | 'warning' | 'error' | 'pending' {
  if (!lastRun) return 'pending';
  
  const hoursAgo = (Date.now() - new Date(lastRun).getTime()) / (1000 * 60 * 60);
  
  if (hoursAgo < expectedHoursAgo * 1.5) return 'healthy';
  if (hoursAgo < expectedHoursAgo * 3) return 'warning';
  return 'error';
}

async function getLastCronRun(table: string, column: string): Promise<string | null> {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from(table)
    .select(column)
    .not(column, 'is', null)
    .order(column, { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) return null;
  return (data as unknown as Record<string, string | null>)[column] ?? null;
}

export async function GET() {
  const now = new Date();
  
  const lastScrapeMaec = await getLastCronRun('scraper_logs', 'created_at');
  const lastCheckAlerts = await getLastCronRun('risk_alerts', 'created_at');
  const lastWeeklyDigest = null;
  
  const status: CronStatus = {
    scrapeMaec: {
      lastRun: lastScrapeMaec,
      nextRun: lastScrapeMaec ? getNextCronTime(lastScrapeMaec) : null,
      status: calculateStatus(lastScrapeMaec, 24),
    },
    checkAlerts: {
      lastRun: lastCheckAlerts,
      nextRun: lastCheckAlerts ? getNextCronTime(lastCheckAlerts) : null,
      status: calculateStatus(lastCheckAlerts, 24),
    },
    weeklyDigest: {
      lastRun: lastWeeklyDigest,
      nextRun: lastWeeklyDigest ? getNextCronTime(lastWeeklyDigest) : null,
      status: calculateStatus(lastWeeklyDigest, 168),
    },
    overall: 'healthy',
    currentTime: now.toISOString(),
    nextScheduled: getNextCronTime(lastScrapeMaec) || now.toISOString(),
  };
  
  const statuses = [status.scrapeMaec.status, status.checkAlerts.status, status.weeklyDigest.status];
  if (statuses.includes('error')) status.overall = 'error';
  else if (statuses.includes('warning')) status.overall = 'warning';
  else if (statuses.includes('pending')) status.overall = 'pending';
  else status.overall = 'healthy';
  
  return NextResponse.json(status, {
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}