# PowerShell script to install SMS/WhatsApp dependencies

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  SMS & WhatsApp Setup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file NOT found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creating .env from template..." -ForegroundColor Yellow
    
    $envContent = @"
# Database
DATABASE_URL=./data.db

# Google Maps API (Replace with your API keys)
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY

# Twilio - Replace with your Twilio credentials
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER

# Server Port
PORT=4000
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installing Twilio and QRCode packages..." -ForegroundColor Cyan
Write-Host ""

# Try to install packages, ignoring Python errors from better-sqlite3
npm install --ignore-scripts twilio qrcode @types/qrcode 2>&1 | Out-Null

# Check if packages were installed
if (Test-Path "node_modules/twilio") {
    Write-Host "✅ Twilio package installed" -ForegroundColor Green
} else {
    Write-Host "❌ Twilio package failed to install" -ForegroundColor Red
}

if (Test-Path "node_modules/qrcode") {
    Write-Host "✅ QRCode package installed" -ForegroundColor Green
} else {
    Write-Host "❌ QRCode package failed to install" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run dev" -ForegroundColor White
Write-Host "2. Check that you see: '📱 SMS/WhatsApp: Enabled'" -ForegroundColor White
Write-Host "3. Open http://localhost:5173/whatsapp-sms" -ForegroundColor White
Write-Host "4. Test SMS subscription!" -ForegroundColor White
Write-Host ""

