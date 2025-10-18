steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/servoya-cloud-worker', '.']

  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/servoya-cloud-worker']

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args: [
      'run', 'deploy', 'servoya-cloud-worker',
      '--image', 'gcr.io/$PROJECT_ID/servoya-cloud-worker',
      '--region', 'us-central1',
      '--platform', 'managed',
      '--allow-unauthenticated'
    ]

options:
  logging: CLOUD_LOGGING_ONLY
