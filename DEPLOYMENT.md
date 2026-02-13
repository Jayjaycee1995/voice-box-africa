# Deployment Guide - VoiceBox Africa

This guide will help you deploy VoiceBox Africa to various platforms including GitHub.

## GitHub Deployment Options

### Option 1: GitHub Pages (Static Frontend)

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**:
   - Enable GitHub Pages in repository settings
   - Set source to `gh-pages` branch or `docs` folder
   - Use the built files from `dist/` or `build/` directory

### Option 2: Vercel Deployment (Recommended)

1. **Connect to Vercel**:
   - Push your code to GitHub
   - Connect your GitHub repository to Vercel
   - Configure build settings:
     - Framework: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

2. **Environment Variables**:
   - Add your environment variables in Vercel dashboard
   - Include `VITE_API_URL` for backend API

### Option 3: Full Stack Deployment

#### Frontend (Vercel/Netlify)
- Framework: React + Vite
- Build Command: `npm run build`
- Output Directory: `dist`

#### Backend (Railway/Render)
- Runtime: Node.js or PHP
- Build Command: `cd laravel-backend && composer install`
- Start Command: `cd laravel-backend && php artisan serve`
- Environment: Add database and app credentials

## Environment Variables

Create `.env` files for both frontend and backend:

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_APP_NAME=VoiceBox Africa
```

### Backend (laravel-backend/.env)
```env
APP_NAME=VoiceBox Africa
APP_ENV=production
APP_KEY=base64:...
DB_CONNECTION=pgsql
DB_HOST=...
DB_PORT=5432
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
```

## Database Setup

1. **Production Database**:
   - Use PostgreSQL on Railway, ElephantSQL, or similar
   - Run migrations: `php artisan migrate --force`

2. **Storage**:
   - Configure S3 or similar for file storage
   - Update filesystem configuration

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Domain Setup

1. **Custom Domain**:
   - Configure DNS settings
   - Add domain to Vercel/Railway
   - Set up SSL certificates

2. **Email**:
   - Configure transactional email service (Mailgun, SendGrid)

## Monitoring

- Set up error tracking (Sentry)
- Configure analytics (Google Analytics, Plausible)
- Monitor performance (Lighthouse CI)

## Security

- Enable HTTPS
- Set security headers
- Regular dependency updates
- Security scanning

## Backup Strategy

- Regular database backups
- Environment variable backups
- Code repository backups

---

For detailed setup instructions, refer to each platform's documentation.