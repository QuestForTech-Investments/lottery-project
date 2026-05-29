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
