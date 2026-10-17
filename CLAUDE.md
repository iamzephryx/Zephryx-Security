# Working notes for this repo

Next.js 15 App Router, static export (`out/`) served by Cloudflare Workers.
Sibling of `zephryx.in` and `zephryx-academy` — deliberately a separate
Worker so a bad push here can't take the other sites down.

This is the **commercial** site: penetration testing services sold to
startups and businesses. Unlike `zephryx-academy`'s pre-launch state, there
is no placeholder content here — services, process, and the lead-capture
form are real. The one exception is the **prices**: they are unvalidated
placeholders (see below).

## Where things live

- `src/lib/site.ts` is the single source of truth for identity, nav, the
  four `SERVICES`, the `PRICING` plans, the `ENGAGEMENT` open/paused flag,
  `PROCESS` steps, `RULES`, and `FAQ`. Nothing else should hardcode a service
  name, link, email address, price, delivery time or reply window. The home
  page, `/pricing/` and every `/services/[slug]/` page (via
  `generateStaticParams`) render from those arrays — adding or re-scoping a
  service or plan is a one-place edit.
- `ENGAGEMENT.accepting` (false by default) switches the site between
  *paused* (every CTA says "Join the waitlist", `/contact/` is the waitlist
  form, `/api/quote` refuses) and *open* (scoping request form,
  `/api/waitlist` refuses). It is read at build time by the pages and the
  Worker, so flipping it needs a rebuild and a deploy.
- `worker/index.ts` handles `/api/quote`, `/api/waitlist`, and the 301
  redirects for removed service slugs (`REMOVED_SERVICE_REDIRECTS`); every
  other request falls through to the static assets. It is excluded from the
  root `tsconfig.json`; `npm run typecheck` checks it via
  `worker/tsconfig.json`.
- `public/_headers` carries the CSP and the rest of the security headers,
  applied at the edge because a static export has no server to set them.

## Don't fabricate business credibility

This is a real services business, not a demo. Never invent client names,
testimonials, case studies, or certifications — none of that exists yet and
putting fake versions on a live site selling security
services is the kind of thing that gets a pentesting firm's own credibility
questioned. The credibility story this site tells is the honest one that's
actually verifiable: the same person runs `zephryx.in` (public writeups,
open-source tooling, published Sigma rules) and `zephryx-academy`, and that
public work is what's linked from `/about/` instead of claims that can't be
checked. If real testimonials, certs, or case studies exist later, add them
— just keep the same "verifiable, not asserted" standard.

**The prices in `PRICING` are unvalidated placeholders** (the block carries
an `UNVALIDATED` comment). They, and the delivery times, scope limits and
`ENGAGEMENT.replyWithin` / `retestWindowDays`, are the owner's decisions to
confirm before `ENGAGEMENT.accepting` is flipped to true. They live in one
typed export so there is one place to change them; never write a price
anywhere else, never state a GST rate or threshold, and never add scarcity
text ("limited slots", counters) — the delivery rows are not capacity claims.

## The form endpoints are the only attack surface — keep it that way

`/api/quote` (scoping request) and `/api/waitlist` are the only pieces of this
site that accept input, so the layers matter: same-origin check, body-size
cap, per-field caps (`FORM_LIMITS`, shared with `QuoteForm.tsx`), honeypot,
submission time-trap (a missing `elapsedMs` counts as a bot), DNS check on the
email domain, service-id shape check plus allow-list, optional KV rate limit,
and literal-`true` authorisation/consent. The guards are shared helpers in
the Worker; if you extend either endpoint, keep all of them. The client IP is
for rate limiting and the notification email only — it is never persisted.
The waitlist has no mail fallback, so it returns 503 rather than `ok:true`
when `LEADS` is not bound.

Two rules worth stating outright:

- **Store before you notify.** A lead persisted to KV is the durable record;
  the email is a notification. A Resend outage must not lose a real business
  inquiry, which is why the handler returns success when the KV write
  succeeded even if the mail failed.
- **Never reflect a secret or an upstream error to the client.** Generic
  message to the visitor, detail to `console.error`.

## Other things worth knowing

- `npm run lint` is not usable — there's no ESLint config, so `next lint`
  drops into an interactive setup prompt. Use `npx tsc --noEmit` plus
  `npm run build`.
- The CSP is `default-src 'self'`. Any external script, font or analytics
  origin needs `public/_headers` widened first, and that should be a
  deliberate decision rather than a fix for a broken embed.
- If this site ever adds anything a reader might copy — a rule, a hash, an
  IOC — follow `zephryx.in`'s standing copy-control rule (see that repo's
  `CLAUDE.md`): nothing that exists to be taken should require a scroll-drag
  out of a `<pre>` to get it.
