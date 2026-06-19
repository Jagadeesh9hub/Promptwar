# Deploying to Google Cloud Run

This app is a static SPA served by **nginx** inside a container. Cloud Run builds
the image from the [`Dockerfile`](Dockerfile) and serves it over HTTPS, scaling to
zero when idle.

## Prerequisites
- A GCP project with billing enabled.
- `gcloud` authenticated (already true in **Cloud Shell**).

## 1. One-time project setup
Run in Cloud Shell, replacing `YOUR_PROJECT_ID`:

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

## 2. Deploy
```bash
git clone https://github.com/Jagadeesh9hub/Promptwar.git
cd Promptwar

gcloud run deploy carbon-footprint-tracker \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

- `--source .` → Cloud Build builds the image using the `Dockerfile` (it will offer
  to create an Artifact Registry repo on first run — accept).
- `--allow-unauthenticated` → the site is publicly reachable.
- `--port 8080` → matches nginx's listen port.

When it finishes, gcloud prints a **Service URL** such as
`https://carbon-footprint-tracker-xxxxxxxxxx-uc.a.run.app`.

## 3. Redeploy after changes
```bash
git pull
gcloud run deploy carbon-footprint-tracker --source . --region us-central1
```

## Notes
- **Region:** change `us-central1` to one nearer your users if you prefer.
- **Cost:** Cloud Run scales to zero; you pay only for request time, which for a
  static SPA is effectively free under the always-free tier.
- **Container contract:** the image serves on `8080`, the SPA fallback routes unknown
  paths to `index.html`, hashed assets are cached for a year, and security headers
  (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy) are set in
  [`nginx.conf`](nginx.conf).
