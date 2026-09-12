import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso';
import { operationLabels, type AnalyticsSnapshot, type OperationName } from '@/lib/analytics/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let schemaReady: Promise<void> | null = null;

function now() {
  return new Date().toISOString();
}

function asNumber(value: unknown) {
  return Number(value ?? 0);
}

async function ensureSchema() {
  if (schemaReady) return schemaReady;

  const db = getTursoClient();
  if (!db) throw new Error('Turso is not configured');

  schemaReady = (async () => {
    await db.execute(`CREATE TABLE IF NOT EXISTS visitors (
      uuid TEXT PRIMARY KEY,
      first_seen TEXT NOT NULL,
      last_seen TEXT NOT NULL,
      visit_count INTEGER NOT NULL DEFAULT 0
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS landing_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_uuid TEXT NOT NULL REFERENCES visitors(uuid),
      visited_at TEXT NOT NULL
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS operations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_uuid TEXT NOT NULL REFERENCES visitors(uuid),
      operation TEXT NOT NULL,
      performed_at TEXT NOT NULL
    )`);
    await db.execute(
      'CREATE INDEX IF NOT EXISTS operations_visitor_performed_at ON operations(visitor_uuid, performed_at DESC)'
    );
  })();

  try {
    await schemaReady;
  } catch (error) {
    schemaReady = null;
    throw error;
  }
}

async function snapshot(): Promise<AnalyticsSnapshot> {
  const db = getTursoClient();
  if (!db) throw new Error('Turso is not configured');

  const [visitorResult, visitsResult, operationsResult, groupedResult, activityResult] = await Promise.all([
    db.execute('SELECT COUNT(*) AS count FROM visitors'),
    db.execute('SELECT COUNT(*) AS count FROM landing_visits'),
    db.execute('SELECT COUNT(*) AS count FROM operations'),
    db.execute('SELECT operation, COUNT(*) AS count FROM operations GROUP BY operation ORDER BY count DESC, operation ASC'),
    db.execute({
      sql: 'SELECT operation, performed_at FROM operations ORDER BY performed_at DESC LIMIT 10',
    }),
  ]);

  return {
    configured: true,
    stats: {
      uniqueVisitors: asNumber(visitorResult.rows[0]?.count),
      totalVisits: asNumber(visitsResult.rows[0]?.count),
      totalOperations: asNumber(operationsResult.rows[0]?.count),
      operations: groupedResult.rows.flatMap((row) => {
        const operation = String(row.operation);
        return operation in operationLabels
          ? [{ operation: operation as OperationName, count: asNumber(row.count) }]
          : [];
      }),
    },
    activity: activityResult.rows.flatMap((row) => {
      const operation = String(row.operation);
      return operation in operationLabels
        ? [{ operation: operation as OperationName, performedAt: String(row.performed_at) }]
        : [];
    }),
  };
}

function unavailable() {
  return NextResponse.json({ configured: false }, { status: 503 });
}

export async function GET(request: NextRequest) {
  const visitorId = request.nextUrl.searchParams.get('visitorId');
  if (!visitorId || !UUID_PATTERN.test(visitorId)) {
    return NextResponse.json({ error: 'A valid visitorId is required' }, { status: 400 });
  }
  if (!getTursoClient()) return unavailable();

  try {
    await ensureSchema();
    return NextResponse.json(await snapshot(), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Analytics are temporarily unavailable' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  let body: { event?: string; visitorId?: string; operation?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.visitorId || !UUID_PATTERN.test(body.visitorId)) {
    return NextResponse.json({ error: 'A valid visitorId is required' }, { status: 400 });
  }
  if (body.event !== 'landing_visit' && body.event !== 'operation') {
    return NextResponse.json({ error: 'Invalid analytics event' }, { status: 400 });
  }
  if (body.event === 'operation' && !(body.operation && body.operation in operationLabels)) {
    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  }
  if (!getTursoClient()) return unavailable();

  try {
    await ensureSchema();
    const db = getTursoClient()!;
    const timestamp = now();

    if (body.event === 'landing_visit') {
      await db.execute({
        sql: `INSERT INTO visitors (uuid, first_seen, last_seen, visit_count)
              VALUES (?, ?, ?, 1)
              ON CONFLICT(uuid) DO UPDATE SET last_seen = excluded.last_seen, visit_count = visitors.visit_count + 1`,
        args: [body.visitorId, timestamp, timestamp],
      });
      await db.execute({
        sql: 'INSERT INTO landing_visits (visitor_uuid, visited_at) VALUES (?, ?)',
        args: [body.visitorId, timestamp],
      });
    } else {
      await db.execute({
        sql: `INSERT INTO visitors (uuid, first_seen, last_seen, visit_count)
              VALUES (?, ?, ?, 0)
              ON CONFLICT(uuid) DO UPDATE SET last_seen = excluded.last_seen`,
        args: [body.visitorId, timestamp, timestamp],
      });
      await db.execute({
        sql: 'INSERT INTO operations (visitor_uuid, operation, performed_at) VALUES (?, ?, ?)',
        args: [body.visitorId, body.operation!, timestamp],
      });
    }

    return NextResponse.json(await snapshot(), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Analytics are temporarily unavailable' }, { status: 503 });
  }
}
