// Cloudflare Worker for it2.sh — the root link tree / command reference.
//
// it2.sh is the front door for a family of one-line tools, each living on its
// own subdomain (speed.it2.sh, hwid.it2.sh, …). This Worker answers the bare
// root with a quick "what / where / which command" reference:
//
//   • Browsers (Accept: text/html)         → a styled HTML link tree
//   • Terminals (curl / PowerShell / wget) → a plain-text cheat-sheet
//
// Everything is driven by the SERVICES registry below — adding a new short
// link is a single object, and both the HTML and the text views update.

// ---------------------------------------------------------------------------
// Service registry — the single source of truth for what it2.sh offers.
//
// Each entry:
//   host    : the subdomain users hit
//   title   : short human name
//   blurb   : one-line "what it does"
//   cmds    : the exact commands to run, grouped by platform label
//   repo    : canonical source repo (optional)
// ---------------------------------------------------------------------------
const SERVICES = [
  {
    host: "speed.it2.sh",
    title: "Speedtest",
    blurb: "Run an Ookla Speedtest CLI from one command on any OS — auto-detects platform & arch, downloads, runs, cleans up.",
    cmds: [
      { label: "Windows (PowerShell)", cmd: "irm speed.it2.sh | iex" },
      { label: "Linux / macOS (bash)", cmd: "curl -sL speed.it2.sh | bash" },
    ],
    repo: "https://github.com/TheTechNetwork/speedtest-pwsh",
  },
  {
    host: "hwid.it2.sh",
    title: "Autopilot HWID",
    blurb: "Intune Autopilot HWID app-registration script with the MSP name baked in from the URL path.",
    cmds: [
      { label: "Windows (PowerShell)", cmd: "irm hwid.it2.sh/TheTechNetwork | iex" },
    ],
    repo: "https://github.com/TheTechNetwork/hwid.it2.sh",
  },
];

const TAGLINE = "One-line tools, short URLs. The it2.sh command reference.";

// ---------------------------------------------------------------------------
// Plain-text view — what terminals (curl / irm / wget) get.
// ---------------------------------------------------------------------------
function renderText() {
  const lines = [];
  lines.push("it2.sh — " + TAGLINE);
  lines.push("=".repeat(60));
  lines.push("");
  for (const s of SERVICES) {
    lines.push(`${s.host}  —  ${s.title}`);
    lines.push(`  ${s.blurb}`);
    for (const c of s.cmds) {
      lines.push(`    ${c.label}:`);
      lines.push(`      ${c.cmd}`);
    }
    if (s.repo) lines.push(`    Source: ${s.repo}`);
    lines.push("");
  }
  lines.push("-".repeat(60));
  lines.push("Re-run anytime:  irm it2.sh  (Windows)   curl -sL https://it2.sh  (Linux/macOS)");
  lines.push("Open https://it2.sh in a browser for the full link tree.");
  lines.push("");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// HTML view — what browsers get. Self-contained (no external assets).
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function renderHtml() {
  const cards = SERVICES.map((s) => {
    const cmds = s.cmds.map((c) => `
        <div class="cmd">
          <span class="cmd-label">${escapeHtml(c.label)}</span>
          <code data-copy="${escapeHtml(c.cmd)}">${escapeHtml(c.cmd)}</code>
        </div>`).join("");
    const repo = s.repo
      ? `<a class="repo" href="${escapeHtml(s.repo)}" target="_blank" rel="noopener">source ↗</a>`
      : "";
    return `
      <article class="card">
        <header>
          <a class="host" href="https://${escapeHtml(s.host)}" target="_blank" rel="noopener">${escapeHtml(s.host)}</a>
          <span class="title">${escapeHtml(s.title)}</span>
        </header>
        <p class="blurb">${escapeHtml(s.blurb)}</p>
        ${cmds}
        ${repo}
      </article>`;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>it2.sh — command reference</title>
<meta name="description" content="${escapeHtml(TAGLINE)}">
<style>
  :root {
    --bg: #0d1117; --panel: #161b22; --border: #30363d;
    --fg: #e6edf3; --muted: #8b949e; --accent: #58a6ff; --code: #0b0f14;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .wrap { max-width: 760px; margin: 0 auto; padding: 3rem 1.25rem 4rem; }
  h1 { font-size: 2.4rem; margin: 0 0 .25rem; letter-spacing: -.02em; }
  h1 .dot { color: var(--accent); }
  .tagline { color: var(--muted); margin: 0 0 2.5rem; }
  .card {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 12px; padding: 1.25rem 1.4rem; margin-bottom: 1.1rem;
  }
  .card header { display: flex; align-items: baseline; gap: .6rem; flex-wrap: wrap; }
  .host { font-weight: 600; color: var(--accent); text-decoration: none; font-size: 1.15rem; }
  .host:hover { text-decoration: underline; }
  .title { color: var(--muted); font-size: .85rem; text-transform: uppercase; letter-spacing: .05em; }
  .blurb { margin: .5rem 0 1rem; color: var(--fg); }
  .cmd { margin: .4rem 0; }
  .cmd-label { display: block; font-size: .75rem; color: var(--muted); margin-bottom: .2rem; }
  code {
    display: block; background: var(--code); border: 1px solid var(--border);
    border-radius: 8px; padding: .6rem .8rem; font-family: "SF Mono", ui-monospace, Menlo, Consolas, monospace;
    font-size: .9rem; cursor: pointer; overflow-x: auto; transition: border-color .15s;
  }
  code:hover { border-color: var(--accent); }
  code.copied { border-color: #3fb950; }
  .repo { display: inline-block; margin-top: .8rem; color: var(--muted); text-decoration: none; font-size: .85rem; }
  .repo:hover { color: var(--accent); }
  footer { margin-top: 2.5rem; color: var(--muted); font-size: .85rem; text-align: center; }
  footer a { color: var(--accent); text-decoration: none; }
</style>
</head>
<body>
  <main class="wrap">
    <h1>it2<span class="dot">.</span>sh</h1>
    <p class="tagline">${escapeHtml(TAGLINE)}</p>
    ${cards}
    <footer>
      Click any command to copy &middot; terminals get a plain-text view via <code style="display:inline;padding:.1rem .35rem">irm it2.sh</code> / <code style="display:inline;padding:.1rem .35rem">curl -sL https://it2.sh</code>
    </footer>
  </main>
<script>
  document.querySelectorAll("code[data-copy]").forEach((el) => {
    el.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(el.dataset.copy);
        el.classList.add("copied");
        setTimeout(() => el.classList.remove("copied"), 900);
      } catch (e) { /* clipboard unavailable */ }
    });
  });
</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Request routing
// ---------------------------------------------------------------------------
function wantsHtml(request) {
  const accept = (request.headers.get("Accept") || "").toLowerCase();
  const ua = (request.headers.get("User-Agent") || "").toLowerCase();
  // Terminal clients (curl, wget, PowerShell) don't ask for HTML.
  if (/\bcurl\b|\bwget\b|powershell|libcurl/.test(ua)) return false;
  return accept.includes("text/html");
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }

    // Ignore browser noise
    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 204 });
    }

    const html = wantsHtml(request);
    const body = html ? renderHtml() : renderText();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": html
          ? "text/html; charset=utf-8"
          : "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "X-Source": "it2.sh",
      },
    });
  },
};
