/**
 * Email Receivers — admin configuration of recipients for automated reports.
 *
 * Only one notification type currently exists: "MONITOREO_JUGADAS" (play
 * monitoring). Each receiver is linked to one or more zones; the scheduled
 * job will use those zones to filter which betting pools' plays go into the
 * email body.
 */

import api from './api';

export const EMAIL_NOTIFICATION_TYPES = {
  MONITOREO_JUGADAS: 'MONITOREO_JUGADAS',
} as const;

export type EmailNotificationType =
  (typeof EMAIL_NOTIFICATION_TYPES)[keyof typeof EMAIL_NOTIFICATION_TYPES];

export interface EmailReceiverZone {
  zoneId: number;
  zoneName: string;
}

export interface EmailReceiver {
  emailReceiverId: number;
  name: string;
  email: string;
  notificationType: EmailNotificationType;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  zones: EmailReceiverZone[];
}

export interface CreateEmailReceiverInput {
  name: string;
  email: string;
  notificationType: EmailNotificationType;
  isActive: boolean;
  zoneIds: number[];
}

export interface UpdateEmailReceiverInput {
  name?: string;
  email?: string;
  notificationType?: EmailNotificationType;
  isActive?: boolean;
  /** When omitted, zones are left untouched. When provided, replaces the set. */
  zoneIds?: number[];
}

export interface EmailReceiverFilters {
  search?: string;
  isActive?: boolean;
  notificationType?: EmailNotificationType;
}

const buildQuery = (filters: EmailReceiverFilters = {}): string => {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive));
  if (filters.notificationType) params.set('notificationType', filters.notificationType);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const getEmailReceivers = async (filters: EmailReceiverFilters = {}): Promise<EmailReceiver[]> => {
  return api.get(`/email-receivers${buildQuery(filters)}`) as Promise<EmailReceiver[]>;
};

export const getEmailReceiverById = async (id: number): Promise<EmailReceiver> => {
  return api.get(`/email-receivers/${id}`) as Promise<EmailReceiver>;
};

export const createEmailReceiver = async (input: CreateEmailReceiverInput): Promise<EmailReceiver> => {
  return api.post('/email-receivers', input) as Promise<EmailReceiver>;
};

export const updateEmailReceiver = async (id: number, input: UpdateEmailReceiverInput): Promise<EmailReceiver> => {
  return api.put(`/email-receivers/${id}`, input) as Promise<EmailReceiver>;
};

/** Soft delete by default (sets is_active = false). Pass `hard: true` to
 *  fully remove the row from the database. */
export const deleteEmailReceiver = async (id: number, hard = false): Promise<void> => {
  await api.delete(`/email-receivers/${id}${hard ? '?hard=true' : ''}`);
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * The preview endpoints return raw `text/html` (the email body), not JSON, so
 * we bypass the shared `api` client (which always parses JSON) and fetch the
 * text directly. The HTML is meant to be dropped into an iframe srcDoc.
 */
const fetchPreviewHtml = async (path: string): Promise<string> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error(`Error al generar la vista previa (HTTP ${response.status}).`);
  }
  return response.text();
};

/** Preview the "Monitoreo de Jugadas" email for an arbitrary date + zones.
 *  Empty `zoneIds` means all zones. `date` is a YYYY-MM-DD string. `drawId`
 *  scopes it to one lottery (the real per-draw email); omit for the whole day. */
export const getPlayMonitoringPreview = async (
  date?: string,
  zoneIds: number[] = [],
  drawId?: number,
): Promise<string> => {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (zoneIds.length > 0) params.set('zoneIds', zoneIds.join(','));
  if (drawId) params.set('drawId', String(drawId));
  const qs = params.toString();
  return fetchPreviewHtml(`/email-receivers/preview${qs ? `?${qs}` : ''}`);
};

/** Preview using the zones already configured on a saved receiver. `drawId`
 *  scopes it to one lottery (one email per draw publication). */
export const getReceiverPreview = async (
  id: number,
  date?: string,
  drawId?: number,
): Promise<string> => {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (drawId) params.set('drawId', String(drawId));
  const qs = params.toString();
  return fetchPreviewHtml(`/email-receivers/${id}/preview${qs ? `?${qs}` : ''}`);
};
