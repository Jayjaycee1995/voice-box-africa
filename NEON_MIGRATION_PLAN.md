# Neon Database Migration & Integration Plan

This document outlines the comprehensive strategy for migrating the Voice Box Africa application database to **Neon (Serverless Postgres)** and integrating it with your Netlify-hosted frontend and Laravel backend.

## Architecture Overview
*   **Frontend**: React (Vite) hosted on Netlify.
*   **Backend**: Laravel API. *Note: Laravel requires a PHP runtime and cannot be hosted directly on Netlify's standard static/serverless platform. Ideally, this should be hosted on a service like Railway, Heroku, or Render, which connects to Neon.*
*   **Database**: Migrating from Local MySQL to **Neon Postgres**.

---

## 1. Setting up Neon Database Instances

### Production Environment
1.  **Create Project**: Log in to the Neon Console and create a new project named `voice-box-prod`.
2.  **Region**: Select the region closest to your backend hosting (e.g., `us-east-1`, `eu-central-1`).
3.  **Database Name**: Use `voicebox_prod`.
4.  **Connection String**: Copy the "Pooled connection string" from the Dashboard. It looks like:
    ```
    postgres://user:password@ep-host-123.aws.neon.tech/voicebox_prod?sslmode=require
    ```

### Development/Staging Environment
1.  **Create Branch**: In Neon, create a branch from `main` named `dev` or `staging`.
2.  **Database Name**: Use `voicebox_dev`.
3.  **Connection String**: Copy the connection string for this branch.

---

## 2. Updating Application Configuration

### Laravel Configuration (`laravel-backend`)
We have already updated `config/database.php` to support the `DB_SSLMODE` environment variable.

**Local Development (`.env`):**
Update your local `.env` file in `laravel-backend`:
```dotenv
DB_CONNECTION=pgsql
# Use the Direct Connection string for migrations/local dev to avoid pooling issues with prepared statements if needed
DATABASE_URL=postgres://[user]:[password]@[host]/[dbname]?sslmode=require
```

**Production Configuration:**
Ensure the backend host uses the **Pooled Connection** string for better performance under load.

---

## 3. Database Migration Strategy (MySQL -> Neon Postgres)

Since we are moving from MySQL to Postgres, we cannot simply dump and restore.

### Option A: Laravel Migrations (Recommended)
If your `database/migrations` are complete and up-to-date, the cleanest way is to re-run them on Neon.
1.  **Configure `.env`** to point to Neon.
2.  **Run Migrations**:
    ```bash
    php artisan migrate
    ```
3.  **Seed Data**: If you have seeders (`database/seeders`), run:
    ```bash
    php artisan db:seed
    ```

### Option B: Data Transfer (If preserving existing data)
If you have production data in MySQL that must be moved:
1.  **Use `pgloader`**: A powerful tool to migrate from MySQL to Postgres.
    ```bash
    pgloader mysql://user:pass@localhost/dbname postgres://user:pass@neon-host/dbname?sslmode=require
    ```
2.  **Manual Export/Import**: Export data as CSV from MySQL and use `COPY` command in Postgres, but this handles relationships poorly.

---

## 4. Configuring Environment Variables

### Netlify (Frontend)
The frontend only needs to know the API URL, not the database credentials.
1.  **Site Settings > Environment Variables**.
2.  Add `VITE_API_URL`: The URL of your deployed Laravel backend (e.g., `https://voice-box-api.railway.app/api`).

### Backend Host (e.g., Railway/Heroku)
Securely store the Neon credentials here.
1.  `DB_CONNECTION`: `pgsql`
2.  `DATABASE_URL`: `postgres://...` (The Neon connection string)
3.  `DB_SSLMODE`: `require`

---

## 5. Testing the Integration (Staging)

1.  **Connect Local App to Neon Dev Branch**:
    *   Update local `.env` with Neon Dev connection string.
    *   Run `php artisan migrate`.
    *   Test: Registration, Login, Gig Posting, Password Reset.
2.  **Verify Data Types**: Postgres is stricter than MySQL. Check:
    *   Boolean fields (0/1 vs true/false).
    *   Date formats.
    *   JSON columns.

---

## 6. Monitoring and Alerting

1.  **Neon Dashboard**: Use the "Monitoring" tab to track:
    *   Active connections (ensure you stay within limits).
    *   CPU/RAM usage.
    *   Storage growth.
2.  **Application Monitoring**: Install **Sentry** or **Laravel Telescope** to catch SQL errors in production.

---

## 7. Rollback Procedures

If the integration fails:
1.  **Immediate Revert**: Change the `DATABASE_URL` env var on the backend host back to the old MySQL database.
2.  **Data Consistency**: Note that any data written to Neon during the outage will need to be manually backported if you revert.
3.  **Code Revert**: If code changes were made for Postgres compatibility, revert the git commit.

---

## 8. Documentation & Notes

### Connection Pooling
Neon provides a built-in connection pooler (PgBouncer) at port `6543`.
*   **Transactional Mode**: Good for general queries.
*   **Session Mode** (Direct, port `5432`): Required for running `php artisan migrate` or heavy schema changes.
*   **Recommendation**: Use Port `6543` for the application runtime (`DATABASE_URL`), and Port `5432` for running migrations.

### SSL Requirements
Neon requires SSL. Ensure `?sslmode=require` is appended to the connection string and `DB_SSLMODE=require` is set.

### Serverless Architecture
Since Neon scales to zero:
*   **Cold Starts**: The first query after inactivity might take 300-500ms longer.
*   **Retry Logic**: Ensure Laravel's database connection has `retry` logic (enabled by default in modern versions) to handle transient wake-up connection failures.

### Troubleshooting (Windows/XAMPP)
If you encounter "driver not found" or "Endpoint ID is not specified":
1.  **Enable Extensions**: Edit `C:\xampp\php\php.ini` and uncomment:
    ```ini
    extension=pdo_pgsql
    extension=pgsql
    ```
2.  **Endpoint ID Error**: If using an older Postgres client (common in XAMPP), append the endpoint option to your `DB_HOST`:
    ```dotenv
    DB_HOST="ep-steep-dew-123456.us-east-2.aws.neon.tech;options=endpoint=ep-steep-dew-123456"
    ```
