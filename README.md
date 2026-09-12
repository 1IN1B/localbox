# Localbox

Browser-based PDF and audio utilities with no file uploads. Processing stays on the device; optional anonymous usage analytics are stored in Turso.

## Turso analytics

Set these server-only environment variables locally and in Vercel to enable landing-page and completed-operation analytics:

```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-token
```

Create the values with `turso db show --url <database-name>` and `turso db tokens create <database-name>`. The app creates its `visitors`, `landing_visits`, and `operations` tables on first use. Each browser receives an anonymous UUID in local storage; no files, file names, or document content are sent to Turso.
