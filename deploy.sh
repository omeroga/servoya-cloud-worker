set -e
SERVICE_NAME='servoya-cloud-worker'
REGION='us-central1'
PROJECT_ID=servoya-cloud-worker
echo '--- Building Docker image ---'
gcloud builds submit --tag gcr.io// .
echo '--- Deploying to Cloud Run ---'
gcloud run deploy  --image gcr.io// --region  --allow-unauthenticated
echo '--- Deployment completed successfully ---'
