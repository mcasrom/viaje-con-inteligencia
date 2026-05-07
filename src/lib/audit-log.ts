import { supabaseAdmin } from './supabase-admin';

interface AuditLogEntry {
  action: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  email?: string;
  metadata?: Record<string, any>;
  ip?: string;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      user_id: entry.userId,
      email: entry.email,
      metadata: entry.metadata || {},
      ip: entry.ip,
    });
  } catch {
    // Silently fail – audit should never break the app
  }
}
