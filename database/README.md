# CivicPulse Database Subsystem

PostgreSQL + PostGIS database schema, spatial migration scripts, and initial seed datasets.

---

## 🗄️ Structure

```text
database/
├── migrations/
│   └── 001_initial_schema.sql  # Database initialization migration
├── schemas/
│   └── schema.sql              # Full PostgreSQL + PostGIS DDL schema
├── seeds/
│   ├── seed_data.py            # Flagship incident records (#CP102) & baseline KPI numbers
│   └── users_db.json           # Seed accounts with pre-hashed bcrypt credentials
└── README.md
```

---

## 🚀 Setting up with Neon PostgreSQL (Cloud)

1. Create a free serverless PostgreSQL database on [Neon.tech](https://neon.tech).
2. Under **Database Settings**, enable the `postgis` extension.
3. In the SQL Editor, copy and execute `database/schemas/schema.sql`.
4. Copy the connection string:
   ```env
   DATABASE_URL=postgresql://neondb_owner:password@ep-xyz.aws.neon.tech/neondb?sslmode=require
   ```
5. Place this connection string in `backend/.env`.

---

## 💻 Local PostgreSQL / Docker PostGIS

To run PostGIS locally using Docker:
```bash
docker run --name civicpulse-postgis -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgis/postgis:15-3.3
```

Execute schema migration:
```bash
psql -h localhost -U postgres -d postgres -f database/schemas/schema.sql
```
