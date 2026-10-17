/**
 * Single source of truth for whether new engagements are being accepted.
 *
 * Imported by the static pages (`@/lib/engagement`) AND by `worker/index.ts`
 * (relative path; wrangler bundles it), so the UI and /api/quote are decided
 * by the same line and cannot disagree. Keep this file import-free so the
 * Worker bundle stays trivial.
 *
 * Flipping it needs a rebuild and a deploy — the pages are baked at build time.
 * Typed `boolean` (not the literal `false`) so TypeScript doesn't narrow the
 * branches away.
 *
 * When false: no request CTA/form, /api/quote answers 503 and stores/sends
 * nothing, and copy promising availability or response times is hidden.
 * Service pages stay visible.
 */
export const ACCEPTING_ENGAGEMENTS: boolean = false;

/** The only thing said to visitors while paused — deliberately no timeline. */
export const NOT_ACCEPTING_MESSAGE = 'Not accepting new engagements right now.';
