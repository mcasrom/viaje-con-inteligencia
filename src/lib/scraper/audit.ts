export type ScraperStatus = 'healthy' | 'warning' | 'error';

export interface ScraperAuditEntry {
  scraper: string;
  status: ScraperStatus;
  message: string;
  timestamp: string;
  details?: string;
}

export interface ScraperAuditSummary {
  overall: ScraperStatus;
  lastCheck: string;
  scrapers: ScraperAuditEntry[];
  consecutiveErrors: number;
}

const MAX_CONSECUTIVE_ERRORS = 3;
const ERROR_WINDOW_MS = 1000 * 60 * 30;

class ScraperAuditor {
  private entries: ScraperAuditEntry[] = [];
  private consecutiveErrors = 0;
  private lastSuccessTime: string | null = null;

  log(scraper: string, status: ScraperStatus, message: string, details?: string) {
    const entry: ScraperAuditEntry = {
      scraper,
      status,
      message,
      timestamp: new Date().toISOString(),
      details,
    };
    
    this.entries.unshift(entry);
    if (this.entries.length > 100) {
      this.entries = this.entries.slice(0, 100);
    }

    if (status === 'error') {
      this.consecutiveErrors++;
    } else {
      this.consecutiveErrors = 0;
      this.lastSuccessTime = entry.timestamp;
    }
  }

  getSummary(): ScraperAuditSummary {
    const recentErrors = this.entries.filter(e => {
      const entryTime = new Date(e.timestamp).getTime();
      return entryTime > Date.now() - ERROR_WINDOW_MS && e.status === 'error';
    });

    let overall: ScraperStatus = 'healthy';
    if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      overall = 'error';
    } else if (recentErrors.length > 0) {
      overall = 'warning';
    }

    const lastCheck = this.entries[0]?.timestamp || new Date().toISOString();

    return {
      overall,
      lastCheck,
      scrapers: this.entries.slice(0, 20),
      consecutiveErrors: this.consecutiveErrors,
    };
  }

  getLastSuccess(): string | null {
    return this.lastSuccessTime;
  }

  getErrorsSince(since: Date): ScraperAuditEntry[] {
    return this.entries.filter(e => 
      new Date(e.timestamp) > since && e.status === 'error'
    );
  }
}

export const scraperAuditor = new ScraperAuditor();

export function logScraperSuccess(scraper: string, message: string) {
  scraperAuditor.log(scraper, 'healthy', message);
}

export function logScraperWarning(scraper: string, message: string, details?: string) {
  scraperAuditor.log(scraper, 'warning', message, details);
}

export function logScraperError(scraper: string, message: string, details?: string) {
  scraperAuditor.log(scraper, 'error', message, details);
}

export function getScraperStatus(): ScraperAuditSummary {
  return scraperAuditor.getSummary();
}
