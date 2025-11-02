Deploy notes
============

This repository contains a React frontend (`frontend`) and an Express backend (`backend`).

Frontend (GitHub Pages)
- I've added a `homepage` field to `frontend/package.json` set to:

  https://patibandasarvani.github.io/EBPL-final-project

- A GitHub Actions workflow was added at `.github/workflows/deploy-frontend.yml`.
  On each push to `main` the workflow will:
  1. checkout the repo
  2. install dependencies in `frontend`
  3. run `npm run build`
  4. upload `frontend/build` for Pages to deploy

To enable GitHub Pages:
1. Push these changes to the `main` branch on GitHub.
2. In the repository Settings > Pages, ensure the source is set to "GitHub Actions" (it should automatically pick up the uploaded artifact after the workflow runs).
3. After the workflow completes, your site should be available at the `homepage` URL above.

Backend (hosting options)
- GitHub Pages only hosts static sites. For the Express backend, choose a hosting provider such as:
  - Render (render.com) — easy GitHub deploys, free tier available.
  - Railway (railway.app) — quick deploy from GitHub.
  - Heroku (if you still use it) — classic option (may require setup).
  - Vercel or Fly — if you convert the backend to serverless functions.

Notes on automated backend deploys
- Deploying the backend from GitHub Actions is possible, but typically requires storing provider-specific API keys or tokens in the repository Secrets (Settings > Secrets and variables > Actions). If you pick a provider I can add a sample deploy workflow and tell you which secret(s) to add.

If you want, I can:
- Open a PR in this repo that wires the backend to Render with a Render-specific GitHub Action (you'll need to create an API key and paste it in repo Secrets), or
- Create a GitHub Actions workflow template for deploying the backend to Heroku (needs API key), or
- Walk you through enabling Pages and verifying the deployed frontend.

Render deploy automation (what I added)
-------------------------------------

I can (and just added) a GitHub Actions workflow that will trigger a Render deploy and then update `LINKS.md` in this repository with the live URLs for the frontend and backend.

What I added:
- `.github/workflows/deploy-backend-render.yml` — triggers a Render deploy on push to `main`, polls until the deploy completes, fetches the service URL from Render, and commits `LINKS.md` with the live URLs.
- `LINKS.md` — initial placeholder file. The workflow will overwrite it with the live frontend and backend URLs after a successful deploy.

What you must add in repository Secrets (Settings > Secrets and variables > Actions):
- `RENDER_API_KEY` — create an API key in your Render dashboard (Account → API Keys). Use the API key value as this secret.
- `RENDER_SERVICE_ID` — the ID of your Render service. To find it, open your service on Render and copy the service id from the URL or from the service settings (it looks like a short alphanumeric id). Put that value in this secret.

Notes and troubleshooting:
- The workflow tries to extract the Render service URL from the Render API response using common fields; if Render's API returns a different shape the workflow may not find the URL automatically. If that happens I can adjust the workflow to match the exact JSON shape of your Render service response.
- The workflow uses the built-in `GITHUB_TOKEN` to commit `LINKS.md` back to the `main` branch. Ensure Actions have permission to write `contents` (the workflow already requests it).

If you'd like I can now:
1. Add a small README badge or update `README.md` with the `LINKS.md` contents automatically, or
2. Adjust the Render workflow to retry longer or use a different field to read the service URL.

