import { db } from '@/db';
import { auditLogs } from '@/db/schema';

export async function logAudit(params: {
  userId: string;
  action: string;
  module: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId,
      action: params.action,
      module: params.module,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata,
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}
