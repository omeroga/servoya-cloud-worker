# 🧠 Servoya Cloud Worker - Deploy Script (v3.1 Smart Healthcheck)

Write-Host "🚀 Starting Servoya deployment..." -ForegroundColor Cyan

# 1️⃣ Load environment variables
$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "✅ Loading environment variables..."
    $lines = Get-Content $envFile | Where-Object { $_ -match "=" }
    foreach ($line in $lines) {
        $pair = $line -split "=", 2
        if ($pair.Count -eq 2) {
            [System.Environment]::SetEnvironmentVariable($pair[0].Trim(), $pair[1].Trim(), "Process")
        }
    }
} else {
    Write-Host "❌ .env file not found." -ForegroundColor Red
    exit 1
}

# 2️⃣ Verify Google Cloud auth
Write-Host "🔑 Checking authentication..."
gcloud auth list

# 3️⃣ Build Docker image
Write-Host "🧱 Building Docker image..."
gcloud builds submit --tag "gcr.io/servoya-cloud-worker/auto-downloader"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed." -ForegroundColor Red
    exit 1
}

# 4️⃣ Deploy to Cloud Run
Write-Host "☁️ Deploying to Cloud Run..."
gcloud run deploy servoya-auto-downloader `
    --image "gcr.io/servoya-cloud-worker/auto-downloader" `
    --region us-central1 `
    --platform managed `
    --allow-unauthenticated `
    --memory 512Mi `
    --timeout 300

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed." -ForegroundColor Red
    exit 1
}

# 5️⃣ IAM Binding
Write-Host "👥 Setting IAM policy..."
gcloud run services add-iam-policy-binding servoya-auto-downloader `
    --region=us-central1 `
    --member="user:omer@servoya.com" `
    --role="roles/run.invoker" 2>$null

# 6️⃣ Scheduler Management
Write-Host "⏰ Checking Scheduler job..."
$jobCheck = gcloud scheduler jobs describe servoya-auto-job --location=us-central1 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "🔁 Updating existing job..."
    gcloud scheduler jobs update http servoya-auto-job `
        --location=us-central1 `
        --http-method=GET `
        --uri="https://servoya-auto-downloader-1077572772937.us-central1.run.app" `
        --oidc-service-account-email="1077572772937-compute@developer.gserviceaccount.com" `
        --schedule="0 * * * *" `
        --time-zone="Etc/UTC"
} else {
    Write-Host "🆕 Creating new job..."
    gcloud scheduler jobs create http servoya-auto-job `
        --location=us-central1 `
        --http-method=GET `
        --uri="https://servoya-auto-downloader-1077572772937.us-central1.run.app" `
        --oidc-service-account-email="1077572772937-compute@developer.gserviceaccount.com" `
        --schedule="0 * * * *" `
        --time-zone="Etc/UTC"
}

# 7️⃣ Smart Health Check
Write-Host "🩺 Running smart health check..."

$serviceUrl = gcloud run services describe servoya-auto-downloader --region=us-central1 --format="value(status.url)"
$response = Invoke-WebRequest -Uri "$serviceUrl/health" -UseBasicParsing -ErrorAction SilentlyContinue
$supabaseUrl = $env:SUPABASE_URL
$supabaseKey = $env:SUPABASE_KEY

try {
    $supabaseResp = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/videos?limit=1" -Headers @{apikey=$supabaseKey} -UseBasicParsing -ErrorAction SilentlyContinue
} catch { $supabaseResp = $null }

if ($response.StatusCode -eq 200) {
    Write-Host "✅ Cloud Run service is responding."
} else {
    Write-Host "⚠️ Cloud Run health endpoint failed." -ForegroundColor Yellow
}

if ($supabaseResp -and $supabaseResp.StatusCode -eq 200) {
    Write-Host "✅ Supabase connectivity OK."
} else {
    Write-Host "⚠️ Supabase connection failed." -ForegroundColor Yellow
}

if ($env:GOOGLE_CLIENT_ID -and $env:GOOGLE_CLIENT_SECRET) {
    Write-Host "✅ Google Drive API credentials detected."
} else {
    Write-Host "⚠️ Google Drive API keys missing." -ForegroundColor Yellow
}

Write-Host "🎯 Deployment completed successfully!" -ForegroundColor Green