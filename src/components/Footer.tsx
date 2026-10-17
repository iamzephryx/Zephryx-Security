import Link from 'next/link';
import { DISCLOSURE, ENGAGEMENT, LEGAL, MAILBOX, MODE, NAV, NETWORK, SITE } from '@/lib/site';
import ZephryxMark from '@/components/ZephryxMark';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-32 border-t border-line/70 bg-abyss/60 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <ZephryxMark size={28} />
              <span className="font-mono text-[15px] font-semibold text-ink">
                zephryx<span className="text-red-blood">/security</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-dim">{SITE.tagline}</p>
            <p className="mt-4 font-mono text-[11px] leading-relaxed text-ink-faint">
              Offensive security from{' '}
              <a
                href={SITE.parentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-blood/80 hover:text-red-blood"
              >
                {SITE.parentName}
              </a>
              .
            </p>
            {LEGAL ? <p className="mt-3 text-sm leading-relaxed text-ink-dim">{LEGAL.line}</p> : null}
          </div>

          <nav aria-label="Footer">
            <h3 className="mb-4 font-mono text-[11px] tracking-[0.3em] text-ink-faint">ROUTES</h3>
            <ul className="space-y-2.5">
              {/* zephryx.in already has its own link in the CONTACT column below. */}
              {NAV.filter((item) => !item.external).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-baseline gap-1.5 font-mono text-sm text-ink-dim transition-colors hover:text-red-blood"
                  >
                    {item.label}
                    <span className="text-[10px] text-ink-faint transition-colors group-hover:text-red-blood/60" aria-hidden>
                      {item.cmd}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={DISCLOSURE.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-sm text-ink-dim transition-colors hover:text-red-blood"
                >
                  {DISCLOSURE.label}
                  <span className="text-ink-faint" aria-hidden>
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <Link
                  href="/privacy/"
                  className="font-mono text-sm text-ink-dim transition-colors hover:text-red-blood"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 font-mono text-[11px] tracking-[0.3em] text-ink-faint">CONTACT</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`mailto:${MAILBOX.address}`}
                  className="font-mono text-sm text-ink-dim transition-colors hover:text-red-blood"
                >
                  {MAILBOX.address}
                </a>
              </li>
              {/* Sibling sites, rendered from NETWORK in site.ts. These were
                  written out by hand, which is how the parent kept its
                  "research & writeups" label months after the research moved to
                  its own domain, and how the research site ended up unlisted. */}
              {NETWORK.map((site) => (
                <li key={site.href}>
                  <a
                    href={site.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 font-mono text-sm text-ink-dim transition-colors hover:text-red-blood"
                  >
                    {site.host} — {site.blurb}
                    <span className="text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-red-blood">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line/60 pt-6 font-mono text-[11px] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {SITE.parentName}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                ENGAGEMENT.accepting ? 'animate-pulse bg-signal' : 'bg-warn'
              }`}
            />
            {MODE.status}
          </p>
        </div>
      </div>
    </footer>
  );
}
