/**
 * security.zephryx.in — Cloudflare Worker entrypoint.
 *
 * The site is a static Next.js export (`next build` -> ./out) served by Workers
 * Static Assets. This script handles what static assets can't: the
 * /api/quote endpoint (scoping request), the /api/waitlist endpoint, and the
 * redirects for service pages that no longer exist.
 *
 * wrangler.jsonc sets run_worker_first: true, so every request reaches fetch()
 * below. Anything that isn't /api/* or a removed service slug falls straight
 * through to env.ASSETS.fetch(), which serves the static build (including
 * out/404.html for unmatched routes, and out/_headers).
 *
 * Which of the two endpoints is live follows ENGAGEMENT.accepting in
 * src/lib/site.ts (read at bundle time): open -> /api/quote accepts and
 * /api/waitlist refuses; paused -> the reverse.
 *
 * Security posture, shared by both endpoints (see the guard helpers below):
 *  - same-origin only (Origin/Referer checked against the deployment host)
 *  - strict body-size cap + per-field length caps + type checks
 *  - honeypot field + submission time-trap (bots fill hidden fields, submit fast)
 *  - DNS check on the email domain
 *  - optional KV-backed IP rate limit when the LEADS_RL namespace is bound
 *  - everything persisted to KV before anything is sent, so a mail outage
 *    can't silently drop a real business inquiry
 *  - all user content HTML-escaped before it ever reaches the email body
 *  - never reflects secrets; generic errors to the client, details to console
 *  - the client IP is used for rate limiting and the notification email only;
 *    it is never persisted
 *
 * Required environment (Worker → Settings → Variables and Secrets):
 *  - RESEND_API_KEY  (secret)  Resend API key
 *  - LEAD_TO         inbox that receives requests      e.g. hello@security.zephryx.in
 *  - LEAD_FROM       verified Resend sender             e.g. "Zephryx Security <noreply@mail.zephryx.in>"
 * Optional:
 *  - LEADS           KV namespace binding storing leads (lead:*) and the
 *                    waitlist (waitlist:*). Required for the waitlist.
 *  - LEADS_RL        KV namespace binding for rate limiting
 */

import {
  ENGAGEMENT,
  FORM_LIMITS,
  MAILBOX,
  PRIVACY_NOTICE_VERSION,
  REMOVED_SERVICE_REDIRECTS,
  REQUEST_OPTIONS,
  SERVICE_CHOICES,
  type Option,
} from '../src/lib/site';

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
  service?: unknown;
  size?: unknown;
  environment?: unknown;
  timeline?: unknown;
  notes?: unknown;
  authorised?: unknown;
  consent?: unknown;
  hp?: unknown; // honeypot
  elapsedMs?: unknown;
};

const LIMITS = {
  ...FORM_LIMITS,
  serviceIdLen: 60,
  bodyBytes: 16 * 1024,
  minElapsedMs: 2500,
  rlWindowSec: 3600,
  rlMax: 5,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Loose id shape check; the allow-list (SERVICE_CHOICES) is applied after it. */
const SERVICE_ID_RE = /^[a-z0-9-]{1,60}$/;
const REMOVED_SLUG_RE = /^\/services\/([a-z0-9-]+)\/?$/;

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

/** A submitted id, or '' unless it is one of `options`. */
const choice = (v: unknown, options: readonly Option[]): string => {
  const id = str(v, LIMITS.serviceIdLen);
  return SERVICE_ID_RE.test(id) && options.some((o) => o.id === id) ? id : '';
};

const labelOf = (options: readonly Option[], id: string): string =>
  options.find((o) => o.id === id)?.label ?? '(not given)';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/quote' || url.pathname === '/api/quote/') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405);
      if (!ENGAGEMENT.accepting) {
        return json({ ok: false, error: 'New engagements are paused. Please join the waitlist.' }, 503);
      }
      return handleQuote(request, env);
    }

    if (url.pathname === '/api/waitlist' || url.pathname === '/api/waitlist/') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405);
      if (ENGAGEMENT.accepting) {
        return json(
          { ok: false, error: 'The waitlist is closed. Please use the scoping request form.' },
          503,
        );
      }
      return handleWaitlist(request, env);
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ ok: false, error: 'Not found.' }, 404);
    }

    // Service pages that were merged or removed in the redesign.
    const removed = REMOVED_SLUG_RE.exec(url.pathname);
    const target = removed ? REMOVED_SERVICE_REDIRECTS[removed[1]] : undefined;
    if (target) return Response.redirect(new URL(target, url).toString(), 301);

    return env.ASSETS.fetch(request);
  },
};

/* ------------------------------------------------------------- shared guards */

type Guarded = { body: Body } | { reject: Response };

/** Origin check, size caps and JSON parse — the first three layers, identical for both endpoints. */
async function readGuardedBody(request: Request): Promise<Guarded> {
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
    return { reject: json({ ok: false, error: 'Bad origin.' }, 403) };
  }

  // --- size guard ---------------------------------------------------------
  if (Number(request.headers.get('content-length') ?? '0') > LIMITS.bodyBytes) {
    return { reject: json({ ok: false, error: 'Payload too large.' }, 413) };
  }

  // --- parse --------------------------------------------------------------
  try {
    const raw = await request.text();
    if (raw.length > LIMITS.bodyBytes) {
      return { reject: json({ ok: false, error: 'Payload too large.' }, 413) };
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { reject: json({ ok: false, error: 'Malformed request.' }, 400) };
    }
    return { body: parsed as Body };
  } catch {
    return { reject: json({ ok: false, error: 'Malformed request.' }, 400) };
  }
}

/**
 * Honeypot filled, or the form submitted faster than a person could (or with
 * no timing at all, which a browser never sends). The caller answers these
 * with a silent success so a bot learns nothing.
 */
function looksLikeBot(body: Body): boolean {
  const honeypot = str(body.hp, 100);
  const elapsedMs = typeof body.elapsedMs === 'number' ? body.elapsedMs : 0;
  return honeypot.length > 0 || !(elapsedMs >= LIMITS.minElapsedMs);
}

/** KV-backed per-IP limit; a no-op when LEADS_RL is not bound. Returns true when over the limit. */
async function overRateLimit(env: Env, bucket: string, ip: string): Promise<boolean> {
  if (!env.LEADS_RL) return false;
  const key = `${bucket}${ip}`;
  const count = Number((await env.LEADS_RL.get(key)) ?? '0');
  if (count >= LIMITS.rlMax) return true;
  await env.LEADS_RL.put(key, String(count + 1), { expirationTtl: LIMITS.rlWindowSec });
  return false;
}

/* --------------------------------------------------------- /api/quote (scoping) */

async function handleQuote(request: Request, env: Env): Promise<Response> {
  const guarded = await readGuardedBody(request);
  if ('reject' in guarded) return guarded.reject;
  const { body } = guarded;

  const name = str(body.name, LIMITS.name);
  const email = str(body.email, LIMITS.email);
  const company = str(body.company, LIMITS.company);
  const service = choice(body.service, SERVICE_CHOICES);
  const size = choice(body.size, REQUEST_OPTIONS.size);
  const environment = choice(body.environment, REQUEST_OPTIONS.environment);
  const timeline = choice(body.timeline, REQUEST_OPTIONS.timeline);
  const notes = str(body.notes, LIMITS.notes);

  // --- silent bot rejection ----------------------------------------------
  if (looksLikeBot(body)) return json({ ok: true });

  // --- validation ---------------------------------------------------------
  if (name.length < 2) return json({ ok: false, error: 'Name is required.' }, 422);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'A valid work email is required.' }, 422);
  if (!service) return json({ ok: false, error: 'Choose what you want tested.' }, 422);
  if (!size) return json({ ok: false, error: 'Choose a rough size.' }, 422);
  if (!environment) return json({ ok: false, error: 'Choose where testing would run.' }, 422);
  if (!timeline) return json({ ok: false, error: 'Choose when you need results.' }, 422);
  if (body.authorised !== true) {
    return json({ ok: false, error: 'Please confirm you are authorised to approve testing this system.' }, 422);
  }
  if (body.consent !== true) {
    return json({ ok: false, error: 'Please agree to be contacted about this request.' }, 422);
  }

  if (!(await domainAcceptsMail(email))) {
    return json(
      { ok: false, error: "That email domain doesn't appear to accept mail — check for a typo." },
      422,
    );
  }

  // --- rate limit (optional, KV-backed) ----------------------------------
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (await overRateLimit(env, 'rl:', ip)) {
    return json({ ok: false, error: 'Too many requests. Try again later.' }, 429);
  }

  // --- persist ------------------------------------------------------------
  // This is the durable record; the email below is only a notification, so a
  // mail failure must not lose a real business inquiry. The IP is deliberately
  // not part of it.
  const at = new Date().toISOString();
  let stored = false;
  if (env.LEADS) {
    try {
      await env.LEADS.put(
        `lead:${Date.now()}:${email.toLowerCase()}`,
        JSON.stringify({
          name,
          email,
          company,
          service,
          size,
          environment,
          timeline,
          notes,
          authorised: true,
          consent: { at, noticeVersion: PRIVACY_NOTICE_VERSION },
          at,
        }),
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
      { ok: false, error: `Request channel not configured. Email ${MAILBOX.address} directly.` },
      503,
    );
  }

  const fields = {
    name,
    email,
    company: company || '(not given)',
    service: labelOf(SERVICE_CHOICES, service),
    size: labelOf(REQUEST_OPTIONS.size, size),
    environment: labelOf(REQUEST_OPTIONS.environment, environment),
    timeline: labelOf(REQUEST_OPTIONS.timeline, timeline),
    notes: notes || '(none)',
    ip,
  };
  const html = renderEmail(fields);
  const text = `New scoping request\n\nName: ${fields.name}\nEmail: ${fields.email}\nCompany and website: ${fields.company}\nTesting: ${fields.service}\nSize: ${fields.size}\nEnvironment: ${fields.environment}\nResults needed: ${fields.timeline}\nAuthorised to approve testing: yes\nIP: ${fields.ip}\n\nNotes:\n${fields.notes}`;

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
        subject: `[security] scoping request — ${company || name}`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('resend error', res.status, detail);
      if (stored) return json({ ok: true });
      return json({ ok: false, error: `Send failed. Please email ${MAILBOX.address}.` }, 502);
    }
  } catch (e) {
    console.error('resend fetch failed', e);
    if (stored) return json({ ok: true });
    return json({ ok: false, error: `Send failed. Please email ${MAILBOX.address}.` }, 502);
  }

  return json({ ok: true });
}

/* ------------------------------------------------------------ /api/waitlist */

async function handleWaitlist(request: Request, env: Env): Promise<Response> {
  const guarded = await readGuardedBody(request);
  if ('reject' in guarded) return guarded.reject;
  const { body } = guarded;

  const name = str(body.name, LIMITS.name);
  const email = str(body.email, LIMITS.email);
  const service = choice(body.service, SERVICE_CHOICES);

  // --- silent bot rejection ----------------------------------------------
  if (looksLikeBot(body)) return json({ ok: true });

  // --- validation ---------------------------------------------------------
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'A valid work email is required.' }, 422);
  if (body.consent !== true) {
    return json({ ok: false, error: 'Please agree to be emailed when scheduling opens.' }, 422);
  }

  // The waitlist has no mail fallback: without somewhere to store the signup
  // it cannot honestly say it was recorded.
  if (!env.LEADS) {
    console.error('waitlist: LEADS KV namespace not bound');
    return json({ ok: false, error: `The waitlist is unavailable. Email ${MAILBOX.address} instead.` }, 503);
  }

  if (!(await domainAcceptsMail(email))) {
    return json(
      { ok: false, error: "That email domain doesn't appear to accept mail — check for a typo." },
      422,
    );
  }

  // --- rate limit (optional, KV-backed) ----------------------------------
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (await overRateLimit(env, 'rl:wl:', ip)) {
    return json({ ok: false, error: 'Too many requests. Try again later.' }, 429);
  }

  // --- persist ------------------------------------------------------------
  // Keyed by lowercased email so a repeat signup dedupes. An existing entry is
  // left as it was, and the visitor gets the same answer either way, so the
  // endpoint never reveals whether an address is already on the list.
  const key = `waitlist:${email.toLowerCase()}`;
  try {
    if ((await env.LEADS.get(key)) === null) {
      const at = new Date().toISOString();
      await env.LEADS.put(
        key,
        JSON.stringify({
          name,
          email,
          service,
          consent: { at, noticeVersion: PRIVACY_NOTICE_VERSION },
          at,
        }),
      );
    }
  } catch (e) {
    console.error('waitlist kv failed', e);
    return json({ ok: false, error: `Could not save that. Email ${MAILBOX.address} instead.` }, 503);
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
  service: string;
  size: string;
  environment: string;
  timeline: string;
  notes: string;
  ip: string;
}): string {
  const row = (label: string, value: string, last = false) =>
    `<p style="margin:0 0 ${last ? '16' : '6'}px"><span style="color:#5c6675">${label}</span> ${escapeHtml(value)}</p>`;
  const notes = escapeHtml(v.notes).replace(/\n/g, '<br>');
  const n = escapeHtml(v.name);
  return `<!doctype html>
<html>
  <body style="margin:0;background:#06070a;font-family:ui-monospace,Menlo,monospace;color:#e8ebef;padding:24px">
    <table role="presentation" style="max-width:560px;margin:0 auto;border:1px solid #1c2230;background:#0a0c11">
      <tr><td style="border-bottom:1px solid #1c2230;padding:14px 20px;color:#ff2d4b;font-weight:bold">
        security.zephryx.in — scoping request
      </td></tr>
      <tr><td style="padding:20px">
        ${row('name', v.name)}
        ${row('email', v.email)}
        ${row('company and website', v.company)}
        ${row('testing', v.service)}
        ${row('size', v.size)}
        ${row('environment', v.environment)}
        ${row('results needed', v.timeline)}
        ${row('authorised to approve testing', 'yes')}
        ${row('ip', v.ip, true)}
        <div style="border-top:1px solid #1c2230;padding-top:16px;line-height:1.7;color:#98a1af">
          <span style="color:#5c6675">notes</span><br>${notes}
        </div>
      </td></tr>
      <tr><td style="border-top:1px solid #1c2230;padding:12px 20px;color:#5c6675;font-size:12px">
        Reply directly to this email to reach ${n}.
      </td></tr>
    </table>
  </body>
</html>`;
}
