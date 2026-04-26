# heyquill.ai

Marketing site for [Quill](https://github.com/joevasquez/Hex) — a free, privacy-first dictation suite for macOS and iOS.

Static site, deployed via Cloudflare Pages.

## Local preview

```bash
# Any static server works, e.g.:
python3 -m http.server 8080
# Then open http://localhost:8080
```

## Deploy

This repo is connected to Cloudflare Pages — pushes to `main` deploy automatically.

### Manual deploy via Wrangler

```bash
npx wrangler pages deploy . --project-name=heyquill-site
```

## Files

- `index.html` — landing page
- `styles.css` — all styling
- `favicon.svg` — site icon
- `_headers` — Cloudflare Pages headers config
- `wrangler.toml` — Wrangler/Pages config
