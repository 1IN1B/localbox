'use client';

import type { AnalyticsSnapshot, OperationName } from '@/lib/analytics/types';

const VISITOR_ID_KEY = 'localbox.visitor-id';

function createUuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function getVisitorId() {
  let visitorId = window.localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = createUuid();
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

export function resetVisitorId() {
  if (typeof window !== 'undefined') {
    const newId = createUuid();
    window.localStorage.setItem(VISITOR_ID_KEY, newId);
    return newId;
  }
  return '';
}

export async function fetchAnalytics(): Promise<AnalyticsSnapshot | null> {
  try {
    const response = await fetch(`/api/analytics?visitorId=${getVisitorId()}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return (await response.json()) as AnalyticsSnapshot;
  } catch {
    return null;
  }
}

async function requestAnalytics(
  event: 'landing_visit' | 'operation',
  operation?: OperationName
): Promise<AnalyticsSnapshot | null> {
  try {
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, visitorId: getVisitorId(), operation }),
      keepalive: true,
    });

    if (!response.ok) return null;
    return (await response.json()) as AnalyticsSnapshot;
  } catch {
    // Analytics must never interrupt a local conversion when it is unavailable.
    return null;
  }
}

export function recordLandingVisit() {
  return requestAnalytics('landing_visit');
}

export async function trackOperation(operation: OperationName) {
  const snapshot = await requestAnalytics('operation', operation);
  if (snapshot) {
    window.dispatchEvent(new CustomEvent<AnalyticsSnapshot>('localbox:analytics', { detail: snapshot }));
  }
}
