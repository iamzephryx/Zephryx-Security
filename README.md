# zephryx-security

The site behind [security.zephryx.in](https://security.zephryx.in) — Zephryx
Security, penetration testing and offensive security services for startups
and growing businesses.

Live and fully built: services, pricing, methodology, about, and a scoping
request form that becomes a waitlist form while new engagements are paused
(`ENGAGEMENT.accepting` in `src/lib/site.ts`). The prices are unvalidated
placeholders until the owner confirms them.

## Stack

- **Next.js 15** (App Router), built as a fully static export to `out/`
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **Cloudflare Workers** serving `out/` as static assets, with `worker/index.ts`
  handling `/api/quote` and `/api/waitlist`

Same shape as [zephryx.in](https://github.com/iamzephryx/zephryx.in) and
[academy-site](https://github.com/zephryx-academy/academy-site), deployed as
its own Worker so a bad push here can't take the other sites down.

## Local development

```bash
npm install
npm run dev          # next dev on :3000 — /api/* is NOT available here
npm run build        # static export to out/
npm run preview      # build + wrangler dev — the full stack, API included
```

`npm run lint` is not usable (no ESLint config; `next lint` drops into an
interactive setup prompt). Use `npm run typecheck` plus `npm run build`.

## Deploying

See [DEPLOY.md](DEPLOY.md) for first-time Cloudflare setup — the custom
domain, the secrets the request form needs, and the optional KV namespaces.

```bash
npm run deploy       # build + wrangler deploy
```

## Where things live

- `src/lib/site.ts` — identity, nav, the four `SERVICES`, the `PRICING` plans,
  the `ENGAGEMENT` open/paused flag, `PROCESS` steps and `FAQ`. Nothing else
  should hardcode a service name, link, email address or price. Adding,
  removing, or re-scoping a service is a one-place edit there; the home page,
  `/pricing/` and every `/services/[slug]/` page render from it.
- `worker/index.ts` — handles `/api/quote`, `/api/waitlist` and the redirects
  for removed service pages; every other request falls through to the static
  assets. `npm run typecheck` checks it along with the app.
- `public/_headers` — the CSP and the rest of the security headers, applied at
  the edge because a static export has no server to set them.
