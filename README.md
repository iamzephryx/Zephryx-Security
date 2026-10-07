# zephryx-security

The site behind [security.zephryx.in](https://security.zephryx.in) — Zephryx
Security, penetration testing and offensive security services for startups
and growing businesses.

Live and fully built: services, methodology, about, and a lead-capture
request-assessment form. There is no placeholder/pre-launch state here — this
is the commercial front for paid engagements.

## Stack

- **Next.js 15** (App Router), built as a fully static export to `out/`
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **Cloudflare Workers** serving `out/` as static assets, with `worker/index.ts`
  handling `/api/quote`

Same shape as [zephryx.in](https://github.com/iamzephryx/zephryx.in) and
[academy-site](https://github.com/zephryx-academy/academy-site), deployed as
its own Worker so a bad push here can't take the other sites down.

## Local development

```bash
npm install
npm run dev          # next dev on :3000 — /api/quote is NOT available here
npm run build        # static export to out/
npm run preview      # build + wrangler dev — the full stack, API included
```

`npm run lint` is not usable (no ESLint config; `next lint` drops into an
interactive setup prompt). Use `npx tsc --noEmit` plus `npm run build`.

## Deploying

See [DEPLOY.md](DEPLOY.md) for first-time Cloudflare setup — the custom
domain, the secrets the request form needs, and the optional KV namespaces.

```bash
npm run deploy       # build + wrangler deploy
```

## Where things live

- `src/lib/site.ts` — identity, nav, the eight `SERVICES`, `PROCESS` steps and
  `FAQ`. Nothing else should hardcode a service name, link, or email address.
  Adding, removing, or re-scoping a service is a one-place edit there; the
  services index and every `/services/[slug]/` page render from it.
- `worker/index.ts` — handles `/api/quote` and nothing else; every other
  request falls through to the static assets.
- `public/_headers` — the CSP and the rest of the security headers, applied at
  the edge because a static export has no server to set them.
