import type { Metadata } from 'next';
import Link from 'next/link';
import EngagementNotice from '@/components/EngagementNotice';
import Reveal from '@/components/Reveal';
import { ACCEPTING_ENGAGEMENTS } from '@/lib/engagement';
import { SERVICES } from '@/lib/site';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Services',
  description:
    'Web application, network, cloud, Active Directory, and API penetration testing, plus phishing simulation, purple team, and compliance-ready engagements — scoped to your business.',
  path: '/services/',
});

export default function Services() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 pb-16 sm:px-8">
      <EngagementNotice className="mb-8" />
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">SERVICES</p>
        <h1 className="mt-3 font-mono text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Eight ways in, tested properly
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-dim">
          Every engagement is scoped to your actual environment before testing starts — nothing
          here is a fixed package you have to bend your business to fit.
          {ACCEPTING_ENGAGEMENTS && (
            <>
              {' '}
              If what you need isn't a clean match for one of these, say so on the{' '}
              <Link href="/contact/" className="text-red-blood hover:underline">
                contact form
              </Link>{' '}
              and it gets scoped from scratch.
            </>
          )}
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
                <span className="border border-line px-2.5 py-1 font-mono text-[10px] tracking-wider text-ink-faint">
                  {s.duration.toUpperCase()}
                </span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-dim">{s.summary}</p>
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
