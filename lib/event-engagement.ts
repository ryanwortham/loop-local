export const EVENT_INTENT_ACTIONS = ['calendar_add', 'share', 'copy_link'] as const;
export const ATTENDEE_LIFECYCLE_ACTIONS = ['accurate', 'inaccurate'] as const;
export const OPERATOR_LIFECYCLE_ACTIONS = ['confirmed', 'cancelled', 'corrected'] as const;

export type EventIntentAction = typeof EVENT_INTENT_ACTIONS[number];
export type EventLifecycleAction = typeof ATTENDEE_LIFECYCLE_ACTIONS[number] | typeof OPERATOR_LIFECYCLE_ACTIONS[number];
export type EventReporterType = 'attendee' | 'operator';

export type EventIntentSummary = { eventKey: string; calendarAdds: number; shares: number; copyLinks: number; latestAt: string };
export type EventLifecycleRecord = {
  id: string;
  eventKey: string;
  eventTitle: string;
  action: EventLifecycleAction;
  reporterType: EventReporterType;
  note: string;
  createdAt: string;
};

export type EventLifecycleState = {
  eventKey: string;
  action: EventLifecycleAction;
  lastVerifiedAt: string;
};

export function validateEventKey(value: unknown): string {
  if (typeof value !== 'string') return '';
  const key = value.trim();
  return /^[a-zA-Z0-9][a-zA-Z0-9:_-]{0,159}$/.test(key) ? key : '';
}

export function validateIntentAction(value: unknown): EventIntentAction | null {
  return (EVENT_INTENT_ACTIONS as readonly unknown[]).includes(value) ? value as EventIntentAction : null;
}

export function validateLifecycleAction(value: unknown, reporterType: EventReporterType): EventLifecycleAction | null {
  const allowed = reporterType === 'operator' ? OPERATOR_LIFECYCLE_ACTIONS : ATTENDEE_LIFECYCLE_ACTIONS;
  return (allowed as readonly unknown[]).includes(value) ? value as EventLifecycleAction : null;
}

export function cleanCorrectionNote(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, 500);
}
