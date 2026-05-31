# web/ — marketing site + legal pages

A **self-contained** static site: a landing page plus the **Privacy Policy** and
**Terms of Service** that the App Store and Google Play require a public URL for.

- Everything uses **relative paths** (`./assets/…`, `./legal/…`) so the folder
  works at any server root or subpath, and offline.
- Drop a 256px icon at `assets/icon-256.png`, a favicon at `assets/favicon.png`,
  and a few phone screenshots in `assets/screenshots/`.

## The privacy URL must match the store

Whatever URL the policy ends up at (e.g. `https://example.com/legal/privacy-policy.html`)
must be the exact string you enter as the **Privacy Policy URL** in App Store
Connect and Google Play. Deploy the site **before** you submit — both stores
fetch the URL.

## Deploying

Any static host works (GitHub Pages, Netlify, Cloudflare Pages, S3, plain nginx).
Upload the **contents** of `web/` to the server root so `/legal/privacy-policy.html`
resolves.

For a self-hosted setup behind a Cloudflare Tunnel + nginx, see
[`../docs/DEPLOY_WEBSITE.md`](../docs/DEPLOY_WEBSITE.md).
