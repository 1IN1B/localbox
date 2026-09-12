import { createClient, type Client } from '@libsql/client';

let client: Client | null | undefined;

export function getTursoClient() {
  if (client !== undefined) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    client = null;
    return client;
  }

  client = createClient({ url, authToken });
  return client;
}
