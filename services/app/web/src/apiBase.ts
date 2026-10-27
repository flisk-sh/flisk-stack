// Flisk's proxy serves the web app and the api on one port. When port 80 is taken Flisk falls back
// to another (8081, say) but still writes VITE_API_URL without it, so reuse the page's own port.
export function apiBase(configured: string, pagePort: string): string {
  if (!configured || !pagePort) return configured;
  const url = new URL(configured);
  if (url.port) return configured;
  url.port = pagePort;
  return url.toString().replace(/\/$/, '');
}
