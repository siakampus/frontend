// Simple frontend-side backend connectivity check (smoke test).
// Usage:
//   npm run check:backend
// Optional env vars:
//   VITE_API_URL / API_URL        - backend base URL (default: http://localhost:8000)
//   VITE_HEALTH_PATH / HEALTH_PATH - health path (default: /health)
//   BEARER_TOKEN                  - if set, sent as Authorization: Bearer <token>
//   BACKEND_TIMEOUT_MS           - request timeout (default: 8000)

const API_URL =
  process.env.VITE_API_URL ||
  process.env.API_URL ||
  "http://localhost:8000";

const HEALTH_PATH =
  process.env.VITE_HEALTH_PATH ||
  process.env.HEALTH_PATH ||
  "/health";

const TIMEOUT_MS = Number(process.env.BACKEND_TIMEOUT_MS || 8000);
const BEARER_TOKEN = process.env.BEARER_TOKEN;

function joinUrl(base, path) {
  const cleanBase = base.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

async function main() {
  if (typeof fetch !== "function") {
    console.error(
      "This script requires Node 18+ (global fetch). Upgrade Node or add a fetch polyfill."
    );
    process.exit(1);
  }

  const url = joinUrl(API_URL, HEALTH_PATH);

  const headers = {
    "Content-Type": "application/json",
  };

  if (BEARER_TOKEN) headers.Authorization = `Bearer ${BEARER_TOKEN}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    console.log(`Checking backend: ${url}`);

    const res = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    const raw = await res.text();
    let body = raw;

    if (contentType.includes("application/json")) {
      try {
        body = JSON.parse(raw);
      } catch {
        // Keep raw text if JSON parsing fails.
      }
    }

    console.log(`Status: ${res.status}`);
    console.log("Response:", body);

    if (!res.ok) {
      console.error("Backend check failed (non-2xx).");
      process.exit(1);
    }

    console.log("Backend connection OK.");
  } catch (err) {
    if (err && typeof err === "object" && "name" in err && err.name === "AbortError") {
      console.error(`Backend check timed out after ${TIMEOUT_MS}ms.`);
    } else {
      console.error("Backend check failed:", err?.message || err);
    }
    process.exit(1);
  } finally {
    clearTimeout(timeout);
  }
}

main();

