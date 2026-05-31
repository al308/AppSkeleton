# Deploying the marketing/legal site

The `web/` folder is a self-contained static site (landing + privacy + terms).
Upload its **contents** to your host's root so `/legal/privacy-policy.html`
resolves — that exact URL goes into both store listings.

Any static host works. Below is the **Cloudflare Tunnel → nginx** pattern used
for self-hosting several of these apps on one box, one subdomain per app.

> Replace `app.example.com`, the container/host names, and paths with your own.

## 1. nginx — one server block per app

The landing-page nginx container mounts a folder of per-app sites
(`./landingpage` → `/usr/share/nginx/html`) and routes by `server_name`:

```nginx
server {
    listen 80;
    server_name app.example.com;

    root /usr/share/nginx/html/myapp;   # = ./landingpage/myapp on the host
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Put the `web/` contents at `./landingpage/myapp/`. Reload nginx after changes:

```bash
# Note: use `docker exec`, not `docker compose`, if a corrupt .env would break
# compose — exec talks to the running container directly.
docker exec <nginx-container> nginx -t        # validate
docker exec <nginx-container> nginx -s reload  # apply (config is bind-mounted)
```

## 2. Cloudflare — the public hostname

The tunnel ingress is often **cloud-managed**, not the local `config.yml`. Add
the route in the dashboard:

**Zero Trust → Networks → Tunnels → (your tunnel) → Public Hostnames → Add**
- Subdomain `app`, domain `example.com`
- Service: **HTTP** → `<nginx-container>:80`

This also creates the DNS CNAME automatically. Verify:

```bash
curl -I https://app.example.com/
curl -I https://app.example.com/legal/privacy-policy.html   # expect 200
```

## Gotchas

- **Deploy before submitting** — stores fetch the privacy URL.
- If you sync a repo to the server, **don't blindly mirror** binary/secret files
  (corrupt or local-only `.env`, large media). Sync only the site folder + the
  one nginx config, or you can clobber good server files.
- Keep the site **self-contained** (relative paths) so it survives moving between
  root and subpaths.
