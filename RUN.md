# Deploying MHA as a Static Web App (mha.html only)

This guide covers building and deploying **only the standalone web version** of the Message Header
Analyzer (`mha.html`) as a static site. This build has **no Outlook add-in dependency** and **no
telemetry** — it's a self-contained page you can host on any static web server.

Tested on **Node 26** (also works on Node 18–24).

> **Note:** `@fluentui/web-components` declares `engines: { node: "^22.0.0 || ^24.0.0" }` in its own
> `package.json`, so `npm install` will print an `EBADENGINE` warning on Node 26. This is safe to
> ignore — the package works fine at runtime.

---

## First-time setup

```sh
npm install
npm run build:web
```

`npm run build:web` runs a production webpack compile that builds **only the `mha` page** (via
`webpack --env web`) and aliases the Application Insights SDK to a no-op stub, so no telemetry code
is bundled or sent. It auto-cleans stale output first (`prebuild:web` → `npm run clean`).

---

## What gets built

The build writes two folders at the repo root:

| Path | Contents |
|---|---|
| `Pages/mha.html` | The page (script/CSS tags injected automatically) |
| `Pages/<hash>/` | Hashed JS chunks + `mha.css` |
| `Pages/data/rules.json` | Header-validation rules loaded at runtime |
| `Resources/` | Images, including `loader.gif` (spinner) |

No other HTML pages are produced — just `mha.html`.

---

## Deploy to a static host

Upload the repo-root **`Pages/`** and **`Resources/`** folders to your web server's **root**. The
page is then served at:

```
https://<your-domain>/Pages/mha.html
```

> **Must be served from the site root.** The app requests `/Pages/data/rules.json` and
> `/Resources/...` by **absolute** path, so hosting under a subpath (e.g. `example.com/app/Pages/...`)
> will 404 those assets and header-validation rules will silently fail to load. If you need to host
> under a subpath, change `output.publicPath` in `webpack.config.js` to `"auto"` and make the
> `rules.json` fetch in `src/Scripts/rules/loaders/GetRules.ts` relative.

Works with any static host — GitHub Pages, Netlify, S3/CloudFront, nginx, IIS, etc. There is no
server-side component.

---

## Local preview

Serve the repo root with any static file server and open the page:

```sh
npx http-server . -p 8080 -c-1
# then open http://localhost:8080/Pages/mha.html
```

> Serve from the **repo root** (not from `Pages/`) so the absolute `/Pages/...` and `/Resources/...`
> paths resolve. Alternative: `python -m http.server 8080` (same URL).

Paste raw message headers into the textarea and click **Analyze headers** to confirm it works.

---

## Useful scripts

| Script | What it does |
|---|---|
| `npm run build:web` | **Web-only** production build (just `mha.html`, no telemetry) → `Pages/` |
| `npm run clean` | Delete `Pages/` and `Resources/` build output |
| `npm run build` | Full multi-page build (includes the Outlook add-in pages) → `Pages/` |
| `npm run lint` | ESLint on all `.ts`/`.js` sources |
| `npm run lint:fix` | ESLint with auto-fix |
| `npx jest --silent` | Run the Jest test suite directly |

---

## Troubleshooting

### `EBADENGINE` warnings during `npm install`

Safe to ignore. See the note at the top of this file.

### Header-validation rules don't load / 404 on `/Pages/data/rules.json`

The site is being served from a subpath instead of the domain root. Serve from the root (see
**Deploy to a static host** above), or switch to relative paths as described there.

### `Cannot find module 'resolve-cwd'` or similar missing-file errors

The `node_modules` tree is corrupted. Do a clean reinstall:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```
