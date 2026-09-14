import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let schemaReady: Promise<void> | null = null;

const MAX_SCREENSHOT_CHARS = 3_500_000; // ~2.6 MB base64

async function ensureSchema() {
  if (schemaReady) return schemaReady;

  const db = getTursoClient();
  if (!db) throw new Error('Turso is not configured');

  schemaReady = (async () => {
    await db.execute(`CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      amount TEXT,
      transaction_id TEXT,
      screenshot TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
      created_at TEXT NOT NULL
    )`);
  })();

  try {
    await schemaReady;
  } catch (error) {
    schemaReady = null;
    throw error;
  }
}

function isDataUrl(value: unknown): value is string {
  return typeof value === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,/.test(value);
}

export async function POST(request: NextRequest) {
  let body: {
    name?: string;
    amount?: string;
    transactionId?: string;
    screenshot?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const transactionId =
    typeof body.transactionId === 'string' ? body.transactionId.trim().slice(0, 200) : '';
  const screenshot =
    typeof body.screenshot === 'string' && isDataUrl(body.screenshot)
      ? body.screenshot
      : '';
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
  const amount = typeof body.amount === 'string' ? body.amount.trim().slice(0, 20) : '';

  if (!transactionId && !screenshot) {
    return NextResponse.json(
      { error: 'Provide a transaction ID or a payment screenshot.' },
      { status: 400 }
    );
  }
  if (screenshot.length > MAX_SCREENSHOT_CHARS) {
    return NextResponse.json(
      { error: 'The screenshot is too large. Please crop or compress it.' },
      { status: 413 }
    );
  }

  const db = getTursoClient();
  if (!db) {
    return NextResponse.json({ error: 'Donations are temporarily unavailable' }, { status: 503 });
  }

  try {
    await ensureSchema();
    const result = await db.execute({
      sql: `INSERT INTO donations (full_name, amount, transaction_id, screenshot, status, created_at)
            VALUES (?, ?, ?, ?, 'submitted', ?)`,
      args: [name || null, amount || null, transactionId || null, screenshot || null, new Date().toISOString()],
    });
    const id =
      result.rows
        ? Number((result.rows[0] as { [key: string]: unknown } | undefined)?.['last_insert_rowid'])
        : undefined;
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Donations are temporarily unavailable' }, { status: 503 });
  }
}