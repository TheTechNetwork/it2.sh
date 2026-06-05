# it2.sh

The front door for a family of one-line tools. Each tool lives on its own
subdomain and runs in a single command; **`it2.sh` itself is the link tree /
quick command reference** that ties them all together — a tidy, self-hosted
replacement for a pile of `bit.ly` links.

```bash
# In a terminal — plain-text cheat-sheet of every command
curl it2.sh
```

Open <https://it2.sh> in a browser and you get a styled link tree where every
command is one click to copy.

## What's available

| URL | What it does | Command |
| --- | --- | --- |
| [`speed.it2.sh`](https://speed.it2.sh) | Ookla Speedtest CLI, any OS, one line | `irm speed.it2.sh \| iex` (Windows) · `curl -sL speed.it2.sh \| bash` (Linux/macOS) |
| [`hwid.it2.sh`](https://hwid.it2.sh) | Intune Autopilot HWID app-registration, MSP name from the URL | `irm hwid.it2.sh/TheTechNetwork \| iex` |

> The table above is the human copy; the live, always-current list is generated
> from the `SERVICES` registry in [`worker/index.js`](worker/index.js).

## How it works

- A Cloudflare Worker is bound to the root `it2.sh` custom domain.
- It does **content negotiation** on the request:
  - Browsers (`Accept: text/html`) → a self-contained HTML link tree.
  - Terminals (`curl` / `wget` / PowerShell user-agents) → a plain-text
    cheat-sheet, so `curl it2.sh` stays readable and on-brand.
- Both views are rendered from a single `SERVICES` array, so the page can never
  drift out of sync with itself.
- No external assets and no build step — the HTML and CSS are inlined in the
  Worker.

## Adding a new short link

Add one object to the `SERVICES` array in [`worker/index.js`](worker/index.js):

```js
{
  host: "tool.it2.sh",
  title: "Short name",
  blurb: "One line describing what it does.",
  cmds: [
    { label: "Windows (PowerShell)", cmd: "irm tool.it2.sh | iex" },
    { label: "Linux / macOS (bash)", cmd: "curl -sL tool.it2.sh | bash" },
  ],
  repo: "https://github.com/TheTechNetwork/tool", // optional
},
```

Both the HTML link tree and the `curl it2.sh` text view pick it up
automatically. (The new subdomain still needs its own Worker + route — this
registry only documents and links to it.)

## Deploy

```bash
npx wrangler deploy
```

The route and custom domain are configured in [`wrangler.toml`](wrangler.toml).

## Endpoints

| Path | Response |
| --- | --- |
| `/` | HTML link tree (browser) or text cheat-sheet (terminal) |
| `/health` | `200 OK` — health check |
| `/favicon.ico` | `204 No Content` |
