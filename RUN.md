# Running MHA on Modern Node

Tested on **Node 26** (also works on Node 18–24).

> **Note:** `@fluentui/web-components` declares `engines: { node: "^22.0.0 || ^24.0.0" }` in its own
> `package.json`, so `npm install` will print an `EBADENGINE` warning on Node 26. This is safe to
> ignore — the package works fine at runtime.

---

## First-time setup

```sh
npm install
npm run build
```

`npm run build` runs a production webpack compile and outputs to `Pages/`.

---

## Development server

```sh
npm run dev-server
```

Before starting webpack, `npm run dev-server` automatically runs `npm run setup-certs` (via a
`predev-server` hook). That script:

1. Checks whether the HTTPS dev certificates are already trusted.
2. If not, generates new certificate files under `~/.office-addin-dev-certs/` and installs the CA
   into the **CurrentUser\\Root** store using `certutil.exe` (Windows) or the
   `office-addin-dev-certs` installer (macOS/Linux).
3. Exits immediately on subsequent runs when certificates are already valid.

The server listens on **https://localhost:44336** with hot reload enabled.

### Why a custom cert script?

The built-in `office-addin-dev-certs` installer on Windows spawns a PowerShell script that shows a
GUI security dialog. When invoked from a non-interactive shell (CI, VS Code terminal, sub-process),
the dialog never surfaces and the process hangs indefinitely. The `tasks/setup-certs.js` script
replaces that step with `certutil -addstore -user Root`, which installs silently with no prompt.

---

## Other useful scripts

| Script | What it does |
|---|---|
| `npm run build` | Production webpack build → `Pages/` |
| `npm run build:dev` | Development webpack build (no minification) |
| `npm run watch` | Webpack watch mode |
| `npm run setup-certs` | Install HTTPS certs only (runs automatically before dev-server) |
| `npm test` | Jest tests (runs lint first) |
| `npm run lint` | ESLint on all `.ts`/`.js` sources |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run clean` | Delete `Pages/` and `Resources/` build output |

---

## Troubleshooting

### `EBADENGINE` warnings during `npm install`

Safe to ignore. See note at top of this file.

### Port 44336 already in use

Kill the existing process and re-run:

```powershell
# PowerShell
$pid = (netstat -ano | Select-String ":44336").ToString().Trim().Split()[-1]
Stop-Process -Id $pid -Force
```

### Certificates expired or untrusted after a clean install

Run `npm run setup-certs` manually. It detects stale or missing certs, regenerates them, and
re-installs the CA. Dev certificates expire after 30 days by default.

### `Cannot find module 'resolve-cwd'` or similar missing-file errors

The `node_modules` tree is corrupted. Do a clean reinstall:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```
