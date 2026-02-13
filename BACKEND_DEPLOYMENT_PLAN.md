# Backend Deployment Plan (Moving off XAMPP)

To turn off XAMPP and have your application running 100% in the cloud, you need to deploy the **Laravel Backend** to a hosting service.

## The Missing Piece
*   ✅ **Frontend**: Hosted on **Netlify**.
*   ✅ **Database**: Hosted on **Neon**.
*   ❌ **Backend API**: Currently on **Your Laptop (XAMPP)**.

## Recommended Host: Railway (Easiest for Laravel)
We recommend **Railway** because it natively supports Laravel and connects easily to GitHub.

### Step 1: Prepare Your Code
1.  **Push to GitHub**: Ensure your latest code (including `laravel-backend` folder) is on GitHub.
2.  **Root Directory**: Since your Laravel app is in a subfolder (`laravel-backend`), you need to tell the host where to look.

### Step 2: Deploy to Railway
1.  **Sign Up**: Go to [railway.app](https://railway.app) and login with GitHub.
2.  **New Project**: Click "New Project" -> "Deploy from GitHub repo".
3.  **Select Repo**: Choose your `voice-box-africa-main` repository.
4.  **Configure Settings**:
    *   **Root Directory**: Set to `/laravel-backend`.
    *   **Build Command**: `composer install --no-dev --optimize-autoloader && npm install && npm run build`
    *   **Start Command**: `php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT` (Railway uses a custom deploy variable usually, or Nginx. Railway's default PHP buildpack usually handles this, but custom start command might be needed).
    *   *Better approach for Railway*: It usually auto-detects `composer.json`.

### Step 3: Environment Variables (on Railway)
Copy these from your local `.env` to Railway's variables dashboard:
*   `APP_ENV`: `production`
*   `APP_DEBUG`: `false`
*   `APP_KEY`: (Copy from your local .env)
*   `APP_URL`: (The domain Railway gives you, e.g., `https://web-production-123.up.railway.app`)
*   `DB_CONNECTION`: `pgsql`
*   `DATABASE_URL`: (Your Neon connection string)
*   `DB_SSLMODE`: `require`

### Step 4: Update Frontend
Once the backend is live on Railway (e.g., `https://voicebox-api.railway.app`), you need to update Netlify:
1.  Go to Netlify -> Site Settings -> Environment Variables.
2.  Update `VITE_API_URL` to your new Railway URL (`https://voicebox-api.railway.app/api`).
3.  Trigger a new deployment on Netlify.

### Step 5: Turn Off XAMPP
Once Step 4 is done, your Frontend (Netlify) talks to Backend (Railway), which talks to Database (Neon).
**NOW you can safely turn off XAMPP.**
