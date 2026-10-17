import type { Metadata } from 'next';
import Link from 'next/link';
import EngagementNotice from '@/components/EngagementNotice';
import Reveal from '@/components/Reveal';
import { SERVICES, priceLabel, startingPrice } from '@/lib/site';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Services',
  description:
    'Four penetration testing services with a defined scope and a stated starting price: web and API assessment, external network and attack surface, Active Directory, and detection review.',
  path: '/services/',
});

export default function Services() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 pb-16 sm:px-8">
      <EngagementNotice className="mb-8" />
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">SERVICES</p>
        <h1 className="mt-3 font-mono text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Four services, tested properly
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-dim">
          Each service has a defined scope and a starting price, so you know what you are buying
          before we start; the proposal after the scoping call fixes the final number. See{' '}
          <Link href="/pricing/" className="text-red-blood hover:underline">
            pricing
          </Link>{' '}
          for the plans. If what you need isn&apos;t a clean match for one of these, say so on the{' '}
          <Link href="/contact/" className="text-red-blood hover:underline">
            contact page
          </Link>
          .
        </p>
      </Reveal>

      <div className="mt-14 space-y-px border border-line bg-line">
        {SERVICES.map((s, i) => (
          <Reveal key={s.id} delay={(i % 4) * 50}>
            <article className="bg-surface p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-mono text-xl font-semibold text-ink">{s.title}</h2>
                </div>
                <span className="border border-line px-2.5 py-1 font-mono text-[11px] tracking-wider text-ink-dim">
                  {priceLabel(startingPrice(s.id)).toUpperCase()}
                </span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-dim">{s.summary}</p>
              <p className="mt-2 text-sm text-ink-dim">{s.scopeLine}</p>
              <Link
                href={`/services/${s.id}/`}
                className="clip-tab mt-5 inline-flex items-center gap-2 border border-line px-5 py-2.5 font-mono text-[13px] text-ink-dim transition-colors duration-300 hover:border-red-deep/60 hover:text-red-blood"
              >
                full scope &amp; deliverables
                <span aria-hidden>→</span>
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
