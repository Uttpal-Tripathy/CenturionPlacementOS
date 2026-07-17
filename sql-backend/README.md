# PlacementOS SQL Backend (MySQL / PostgreSQL)

A browser can't connect to MySQL/PostgreSQL directly, so this is the middle tier:

```
placementos.html  →  Express REST API (this folder)  →  MySQL / PostgreSQL
```

Set `window.API_BASE` in `placementos.html` to this API's URL and the whole app —
dashboard, student portal, applications, offers, profiles, mock results — reads and writes SQL.

## 1. Create the database + schema

**PostgreSQL**
```bash
createdb placementos
psql "postgres://user:pass@localhost:5432/placementos" -f sql/schema.postgres.sql
```

**MySQL**
```bash
mysql -u root -p -e "CREATE DATABASE placementos"
mysql -u root -p placementos < sql/schema.mysql.sql
```

## 2. Configure + run the API

```bash
npm install
cp .env.example .env      # set DB_KIND (postgres|mysql) and connection details
npm run seed              # optional sample rows
npm start                 # http://localhost:4000
```

`.env` highlights:
- `DB_KIND=postgres` or `mysql`
- `DATABASE_URL=…` (or discrete `DB_HOST/DB_USER/DB_PASS/DB_NAME/DB_PORT`)
- `API_TOKEN=` — if set, the app must send the same value in `window.API_TOKEN`

## 3. Point the app at it

In `placementos.html` (top of the file):
```js
window.API_BASE  = "http://localhost:4000";
window.API_TOKEN = "";   // match API_TOKEN if you set one
```
Reload — the header will read **"SQL database (via API)"** and every module is now SQL-backed.

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/:table` | list rows (newest first) |
| POST | `/api/:table` | create (body = column:value) |
| PUT | `/api/:table/:id` | update |
| DELETE | `/api/:table/:id` | delete |

Tables are whitelisted with their writable columns (see `TABLES` in `server/server.js`),
so unknown tables/columns are rejected — this prevents SQL injection via identifiers, and all
values are passed as bound parameters.

## Notes / hardening for production
- Put this API behind HTTPS and restrict CORS to your app's origin (currently open for dev).
- Add real auth: verify the Google ID token (see the `google-auth` package) and derive the
  user + role server-side instead of trusting the client; gate writes by role.
- The REST layer refetches after each write (near-real-time). For true push updates, add
  WebSockets/SSE or use the Firestore option instead.
- `resumeUrl` / `dataUrl` store base64 files; for large files use object storage (S3) and keep
  only the URL in SQL.

## Real placement data (2024–2027)

Generated from the four uploaded `*_Placement_Summary.xlsx` workbooks:
- `sql/placementos_data.postgres.sql` / `sql/placementos_data.mysql.sql`
- Tables: `placement_users` (leadership + placement office), `placement_summary`
  (school × year stats), `placement_offers` (7,331 offer records across 2024–2027).

Load it (creates the tables and inserts the data):

```bash
# PostgreSQL
psql "$DATABASE_URL" -f sql/placementos_data.postgres.sql
# MySQL
mysql placementos < sql/placementos_data.mysql.sql
```

Leadership seeded (as requested):
| Role | Name |
|------|------|
| Vice President | D N Rao |
| Vice Chancellor | Dr. Prashant Kumar Mohanty |
| Registrar | K V Ravi Kumar |
| Placement Officer | Dr P A Sunny Dayal |
| Administrator | Administrator |

> Note: one 2026 CTC value parses as ₹714 LPA — likely a spreadsheet typo; verify in the source row.
