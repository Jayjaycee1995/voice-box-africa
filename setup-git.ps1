# Git Setup Script for VoiceBox Africa
# Run this script after Git is properly installed and in your PATH

Write-Host "🚀 Setting up Git repository for VoiceBox Africa..." -ForegroundColor Green

# Initialize Git repository
Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
git init

# Add all files to staging
Write-Host "➕ Adding files to staging..." -ForegroundColor Yellow
git add .

# Make initial commit
Write-Host "💾 Making initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: VoiceBox Africa - Voice talent marketplace with African brand showcase"

Write-Host "✅ Git repository initialized successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a new repository on GitHub.com" -ForegroundColor White
Write-Host "2. Run: git remote add origin https://github.com/YOUR-USERNAME/voice-box-africa.git" -ForegroundColor White
Write-Host "3. Run: git branch -M main" -ForegroundColor White
Write-Host "4. Run: git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your project will be live on GitHub!" -ForegroundColor Green