/**
 * security.zephryx.in — Cloudflare Worker entrypoint.
 *
 * The site is a static Next.js export (`next build` -> ./out) served by Workers
 * Static Assets. This script handles the one thing static assets can't: the
 * /api/quote endpoint behind the "request an assessment" form.
 *
 * wrangler.jsonc sets run_worker_first: true, so every request reaches fetch()
 * below. Anything that isn't /api/* falls straight through to
 * env.ASSETS.fetch(), which serves the static build (including out/404.html for
 * unmatched routes, and out/_headers).
 *
 * Security posture for /api/quote:
 *  - same-origin only (Origin/Referer checked against the deployment host)
 *  - strict body-size cap + per-field length caps + type checks
 *  - honeypot field + submission time-trap (bots fill hidden fields, submit fast)
 *  - DNS check on the email domain
 *  - optional KV-backed IP rate limit when the LEADS_RL namespace is bound
 *  - leads persisted to KV when LEADS is bound, so a mail outage can't
 *    silently drop a real business inquiry
 *  - all user content HTML-escaped before it ever reaches the email body
 *  - never reflects secrets; generic errors to the client, details to console
 *
 * Required environment (Worker → Settings → Variables and Secrets):
 *  - RESEND_API_KEY  (secret)  Resend API key
 *  - LEAD_TO         inbox that receives requests      e.g. hello@security.zephryx.in
 *  - LEAD_FROM       verified Resend sender             e.g. "Zephryx Security <noreply@mail.zephryx.in>"
 * Optional:
 *  - LEADS           KV namespace binding storing the lead list
 *  - LEADS_RL        KV namespace binding for rate limiting
 */

import { ACCEPTING_ENGAGEMENTS, NOT_ACCEPTING_MESSAGE } from '../src/lib/engagement';

interface KVLike {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, opts?: { expirationTtl?: number }) => Promise<void>;
}

interface AssetsFetcher {
  fetch: (input: Request | URL | string) => Promise<Response>;
}

interface Env {
  ASSETS: AssetsFetcher;
  RESEND_API_KEY?: string;
  LEAD_TO?: string;
  LEAD_FROM?: string;
  LEADS?: KVLike;
  LEADS_RL?: KVLike;
}

type Body = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  companySize?: unknown;
  services?: unknown;
  message?: unknown;
  hp?: unknown; // honeypot
  elapsedMs?: unknown;
};

const LIMITS = {
  name: 80,
  email: 120,
  company: 100,
  companySize: 20,
  message: 4000,
  maxServices: 8,
  serviceIdLen: 60,
  bodyBytes: 16 * 1024,
  minElapsedMs: 2500,
  rlWindowSec: 3600,
  rlMax: 5,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Loose id shape check — the real allow-list lives in src/lib/site.ts SERVICES;
 * this only guards against garbage/oversized values reaching storage or email. */
const SERVICE_ID_RE = /^[a-z0-9-]{1,60}$/;

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );

const str = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

const services = (v: unknown): string[] => {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim().slice(0, LIMITS.serviceIdLen);
    if (SERVICE_ID_RE.test(trimmed)) out.push(trimmed);
    if (out.length >= LIMITS.maxServices) break;
  }
  return out;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/quote' || url.pathname === '/api/quote/') {
      // Paused: answer before parsing, rate limiting, KV or mail — nothing is read, stored or sent.
      if (!ACCEPTING_ENGAGEMENTS) return json({ ok: false, error: NOT_ACCEPTING_MESSAGE }, 503);
      if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405);
      return handleQuote(request, env);
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ ok: false, error: 'Not found.' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleQuote(request: Request, env: Env): Promise<Response> {
  // --- origin check -------------------------------------------------------
  const host = request.headers.get('host') ?? '';
  const sameSite = (val: string | null): boolean => {
    if (!val) return false;
    try {
      return new URL(val).host === host;
    } catch {
      return false;
    }
  };
  if (!(sameSite(request.headers.get('origin')) || sameSite(request.headers.get('referer')))) {
    return json({ ok: false, error: 'Bad origin.' }, 403);
  }

  // --- size guard ---------------------------------------------------------
  if (Number(request.headers.get('content-length') ?? '0') > LIMITS.bodyBytes) {
    return json({ ok: false, error: 'Payload too large.' }, 413);
  }

  // --- parse --------------------------------------------------------------
  let body: Body;
  try {
    const raw = await request.text();
    if (raw.length > LIMITS.bodyBytes) return json({ ok: false, error: 'Payload too large.' }, 413);
    body = JSON.parse(raw) as Body;
  } catch {
    return json({ ok: false, error: 'Malformed request.' }, 400);
  }

  const name = str(body.name, LIMITS.name);
  const email = str(body.email, LIMITS.email);
  const company = str(body.company, LIMITS.company);
  const companySize = str(body.companySize, LIMITS.companySize);
  const wantedServices = services(body.services);
  const message = str(body.message, LIMITS.message);
  const honeypot = str(body.hp, 100);
  const elapsedMs = typeof body.elapsedMs === 'number' ? body.elapsedMs : 0;

  // --- silent bot rejection ----------------------------------------------
  if (honeypot.length > 0 || (elapsedMs > 0 && elapsedMs < LIMITS.minElapsedMs)) {
    return json({ ok: true });
  }

  // --- validation ---------------------------------------------------------
  if (name.length < 2) return json({ ok: false, error: 'Name is required.' }, 422);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'A valid work email is required.' }, 422);
  if (message.length < 20) return json({ ok: false, error: 'Give a bit more detail on scope.' }, 422);

  if (!(await domainAcceptsMail(email))) {
    return json(
      { ok: false, error: "That email domain doesn't appear to accept mail — check for a typo." },
      422,
    );
  }

  // --- rate limit (optional, KV-backed) ----------------------------------
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (env.LEADS_RL) {
    const key = `rl:${ip}`;
    const count = Number((await env.LEADS_RL.get(key)) ?? '0');
    if (count >= LIMITS.rlMax) {
      return json({ ok: false, error: 'Too many requests. Try again later.' }, 429);
    }
    await env.LEADS_RL.put(key, String(count + 1), { expirationTtl: LIMITS.rlWindowSec });
  }

  // --- persist ------------------------------------------------------------
  // This is the durable record; the email below is only a notification, so a
  // mail failure must not lose a real business inquiry.
  let stored = false;
  if (env.LEADS) {
    try {
      await env.LEADS.put(
        `lead:${Date.now()}:${email.toLowerCase()}`,
        JSON.stringify({ name, email, company, companySize, services: wantedServices, message, ip, at: new Date().toISOString() }),
      );
      stored = true;
    } catch (e) {
      console.error('leads kv put failed', e);
    }
  }

  // --- notify --------------------------------------------------------------
  if (!env.RESEND_API_KEY || !env.LEAD_TO || !env.LEAD_FROM) {
    console.error('quote: missing RESEND_API_KEY / LEAD_TO / LEAD_FROM');
    if (stored) return json({ ok: true });
    return json(
      { ok: false, error: 'Request channel not configured. Email hello@security.zephryx.in directly.' },
      503,
    );
  }

  const html = renderEmail({ name, email, company, companySize, services: wantedServices, message, ip });
  const text = `New assessment request\n\nName: ${name}\nEmail: ${email}\nCompany: ${company || '(not given)'}\nSize: ${companySize || '(not given)'}\nServices: ${wantedServices.join(', ') || '(none selected)'}\nIP: ${ip}\n\nScope:\n${message}`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: env.LEAD_FROM,
        to: [env.LEAD_TO],
        reply_to: email,
        subject: `[security] assessment request — ${company || name}`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('resend error', res.status, detail);
      if (stored) return json({ ok: true });
      return json({ ok: false, error: 'Send failed. Please email hello@security.zephryx.in.' }, 502);
    }
  } catch (e) {
    console.error('resend fetch failed', e);
    if (stored) return json({ ok: true });
    return json({ ok: false, error: 'Send failed. Please email hello@security.zephryx.in.' }, 502);
  }

  return json({ ok: true });
}

/**
 * Confirms the email's domain can plausibly receive mail at all, catching
 * typos and made-up domains without claiming to verify the specific mailbox.
 * Checks MX first, then falls back to A/AAAA per RFC 5321. Fails open on
 * lookup errors — a degraded DNS check should never turn away a real lead.
 */
async function domainAcceptsMail(email: string): Promise<boolean> {
  const domain = email.split('@')[1];
  if (!domain) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  const hasRecords = async (type: 'MX' | 'A' | 'AAAA'): Promise<boolean> => {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`,
      { headers: { accept: 'application/dns-json' }, signal: controller.signal },
    );
    if (!res.ok) throw new Error(`resolver http ${res.status}`);

    const data = (await res.json()) as { Answer?: unknown[]; Status?: number };
    if (data.Status === 3) return false; // NXDOMAIN — definitive
    if (data.Status !== 0) throw new Error(`resolver rcode ${data.Status}`);

    return Array.isArray(data.Answer) && data.Answer.length > 0;
  };

  try {
    if (await hasRecords('MX')) return true;
    if (await hasRecords('A')) return true;
    return await hasRecords('AAAA');
  } catch (e) {
    console.error('dns check failed, allowing request', e);
    return true;
  } finally {
    clearTimeout(timeout);
  }
}

function renderEmail(v: {
  name: string;
  email: string;
  company: string;
  companySize: string;
  services: string[];
  message: string;
  ip: string;
}): string {
  const n = escapeHtml(v.name);
  const e = escapeHtml(v.email);
  const c = escapeHtml(v.company || '(not given)');
  const cs = escapeHtml(v.companySize || '(not given)');
  const svc = escapeHtml(v.services.join(', ') || '(none selected)');
  const m = escapeHtml(v.message).replace(/\n/g, '<br>');
  const ip = escapeHtml(v.ip);
  return `<!doctype html>
<html>
  <body style="margin:0;background:#06070a;font-family:ui-monospace,Menlo,monospace;color:#e8ebef;padding:24px">
    <table role="presentation" style="max-width:560px;margin:0 auto;border:1px solid #1c2230;background:#0a0c11">
      <tr><td style="border-bottom:1px solid #1c2230;padding:14px 20px;color:#ff2d4b;font-weight:bold">
        security.zephryx.in — assessment request
      </td></tr>
      <tr><td style="padding:20px">
        <p style="margin:0 0 6px"><span style="color:#5c6675">name</span> ${n}</p>
        <p style="margin:0 0 6px"><span style="color:#5c6675">email</span> ${e}</p>
        <p style="margin:0 0 6px"><span style="color:#5c6675">company</span> ${c}</p>
        <p style="margin:0 0 6px"><span style="color:#5c6675">size</span> ${cs}</p>
        <p style="margin:0 0 16px"><span style="color:#5c6675">ip</span> ${ip}</p>
        <p style="margin:0 0 6px;color:#5c6675">services requested</p>
        <p style="margin:0 0 16px">${svc}</p>
        <div style="border-top:1px solid #1c2230;padding-top:16px;line-height:1.7;color:#98a1af">
          <span style="color:#5c6675">scope</span><br>${m}
        </div>
      </td></tr>
      <tr><td style="border-top:1px solid #1c2230;padding:12px 20px;color:#5c6675;font-size:12px">
        Reply directly to this email to reach ${n}.
      </td></tr>
    </table>
  </body>
</html>`;
}
