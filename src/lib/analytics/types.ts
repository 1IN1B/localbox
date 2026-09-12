export const operationLabels = {
  'pdf-merge': 'Merge PDF',
  'pdf-trim': 'Trim PDF',
  'images-to-pdf': 'Images to PDF',
  'document-to-pdf': 'Document to PDF',
  'audio-merge': 'Merge Audio',
  'audio-trim': 'Trim Audio',
} as const;

export type OperationName = keyof typeof operationLabels;

export interface AnalyticsStats {
  uniqueVisitors: number;
  totalVisits: number;
  totalOperations: number;
  operations: Array<{ operation: OperationName; count: number }>;
}

export interface ActivityItem {
  operation: OperationName;
  performedAt: string;
}

export interface AnalyticsSnapshot {
  configured: boolean;
  stats: AnalyticsStats;
  activity: ActivityItem[];
}
