# 🚀 Step-by-Step Guide: Deploying Backend to Railway

Your code is now **Cloud-Ready**. I have updated your Laravel configuration (`TrustProxies.php` and `AppServiceProvider.php`) to work perfectly on cloud hosting.

Follow these exact steps to move your backend off XAMPP.

## Prerequisites
1.  **GitHub**: Make sure your latest code is pushed to your GitHub repository.
    *   `git add .`
    *   `git commit -m "Prepare backend for cloud deployment"`
    *   `git push origin main`

## Phase 1: Deploy to Railway (The Host)
Railway is the easiest platform for Laravel.

1.  **Sign Up**: Go to [railway.app](https://railway.app) and log in with GitHub.
2.  **New Project**:
    *   Click **+ New Project**.
    *   Select **Deploy from GitHub repo**.
    *   Choose `voice-box-africa-main`.
3.  **Configure Service**:
    *   Click on the new card created for your repo.
    *   Go to **Settings** tab.
    *   Scroll to **Root Directory** and set it to: `/laravel-backend`
    *   (Railway will now re-build. It might fail the first time, that's okay, we need variables).
4.  **Set Environment Variables**:
    *   Go to the **Variables** tab.
    *   Click **New Variable** (or "Raw Editor" to paste all at once).
    *   Add these (copy from your local `.env` file):
        *   `APP_NAME`: `VoiceBox`
        *   `APP_ENV`: `production`
        *   `APP_KEY`: (Copy the long string starting with `base64:` from your local .env)
        *   `APP_DEBUG`: `false`
        *   `APP_URL`: (Leave blank for a second, we'll get it in step 5)
        *   `DB_CONNECTION`: `pgsql`
        *   `DATABASE_URL`: (Copy your Neon connection string: `postgres://...`)
        *   `DB_SSLMODE`: `require`
5.  **Generate Domain**:
    *   Go to **Settings** -> **Networking**.
    *   Click **Generate Domain** (e.g., `voicebox-production.up.railway.app`).
    *   Copy this domain.
    *   Go back to **Variables** and add `APP_URL` with value `https://voicebox-production.up.railway.app` (your actual domain).
6.  **Redeploy**:
    *   Railway usually redeploys automatically when variables change. If not, click **Deployments** -> **Redeploy**.

## Phase 2: Run Migrations on Cloud
Once the deployment is green (Success):
1.  In Railway, click your service card.
2.  Click the **Command + K** menu or look for "Shell" / "Terminal" tab (Command Palette -> Shell).
3.  Type: `php artisan migrate --force`
    *   This ensures your cloud backend is in sync with the database.

## Phase 3: Connect Frontend (Netlify)
Now your backend is live at `https://your-app.up.railway.app`.

1.  Go to **Netlify** -> Your Site -> **Site Configuration**.
2.  **Environment Variables**.
3.  Edit `VITE_API_URL`.
4.  Change it from `http://localhost:8000` to your new Railway URL:
    *   `https://voicebox-production.up.railway.app/api` (Don't forget the `/api` at the end if that's how your frontend expects it, usually just the base URL is needed depending on your code, but usually `VITE_API_URL` is the base).
    *   *Check your code*: If your code does `${import.meta.env.VITE_API_URL}/login`, then no `/api`. If it does `${...}/api/login`, then yes.
    *   *Correction*: Standard Laravel API is at `/api`. If your frontend appends `/api`, just put the domain.
5.  **Trigger Deploy**: Go to Deploys -> **Trigger deploy** -> **Deploy site**.

## Phase 4: The Moment of Truth
1.  Wait for Netlify to build.
2.  Open your Netlify site.
3.  Try to Login.
4.  **If it works, you can close XAMPP!** 🎉
