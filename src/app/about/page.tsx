import type { Metadata } from 'next';
import Link from 'next/link';
import { ACCEPTING_ENGAGEMENTS } from '@/lib/engagement';
import { MAILBOX, PUBLIC_WORK, SITE } from '@/lib/site';
import EngagementNotice from '@/components/EngagementNotice';
import Reveal from '@/components/Reveal';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description:
    'Zephryx Security is run by the penetration tester and security researcher behind zephryx.in — public writeups, open-source tooling and detection rules as proof of work before you ever get on a call.',
  path: '/about/',
});

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-32 pb-16 sm:px-8">
      <EngagementNotice className="mb-8" />
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">ABOUT</p>
        <h1 className="mt-3 font-mono text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Who does the testing
        </h1>
      </Reveal>

      <Reveal delay={60}>
        <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-ink-dim">
          <p>
            {SITE.name} is run by the same person behind{' '}
            <a
              href={SITE.parentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-blood hover:underline"
            >
              zephryx.in
            </a>{' '}
            — a penetration tester and security researcher who spends the week breaking into
            networks and applications, and the rest of it publishing exactly how: attack-path
            writeups, open-source recon and enumeration tooling, and the Sigma detection rules
            that come out of the research.
          </p>
          <p>
            That public work is the point. Most firms ask you to trust a sales page and a logo
            wall. Here, the actual methodology — how an Active Directory domain gets chained from
            a single foothold to domain admin, how a Sigma rule gets validated before it ships —
            is published and reviewable before you ever get on a scoping call.
          </p>
          <p>
            There is no bench of junior analysts. The person who scopes the engagement on the
            call is the person who runs the testing and writes the report. That's a deliberate
            trade: it caps how many engagements run at once, and it means the report in your
            inbox was written by someone who was actually there for every finding in it.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <section className="mt-16">
          <h2 className="font-mono text-2xl font-bold tracking-tight text-ink">Where the work is public</h2>
          <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-3">
            {PUBLIC_WORK.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-surface p-6 transition-colors duration-300 hover:bg-elevated"
              >
                <h3 className="font-mono text-[15px] font-semibold text-ink">{item.title}</h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-ink-dim">{item.blurb}</p>
                {/* `block` + `break-words`, not `inline-flex`: an inline-flex
                    container sizes to its content and will not wrap, so a
                    hostname longer than the card silently overflows it and
                    pushes the page into horizontal scroll. These labels grew
                    when the research moved to its own domain. */}
                <span className="mt-4 block break-words font-mono text-[11px] text-red-blood/80">
                  {item.label} <span aria-hidden>↗</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      </Reveal>

      {ACCEPTING_ENGAGEMENTS && (
      <Reveal>
        <section className="mt-16 panel clip-corner p-7">
          <h2 className="font-mono text-lg font-semibold text-ink">Reach out</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim">
            Questions about scope, timeline, or whether a service on this site is even the right
            fit —{' '}
            <a href={`mailto:${MAILBOX.address}`} className="font-mono text-red-blood hover:underline">
              {MAILBOX.address}
            </a>
            , or use the request form.
          </p>
          <Link
            href="/contact/"
            className="clip-tab mt-6 inline-flex items-center gap-2 border border-red-deep bg-red-core px-6 py-3 font-mono text-sm font-medium text-void transition-all duration-300 hover:shadow-[0_0_30px_-4px_rgba(255,45,75,0.8)]"
          >
            ./request-assessment
          </Link>
        </section>
      </Reveal>
      )}
    </div>
  );
}
