import type { Metadata } from 'next';
import { ACCEPTING_ENGAGEMENTS, NOT_ACCEPTING_MESSAGE } from '@/lib/engagement';
import { MAILBOX } from '@/lib/site';
import Reveal from '@/components/Reveal';
import QuoteForm from '@/components/QuoteForm';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata(
  ACCEPTING_ENGAGEMENTS
    ? {
        title: 'Request an assessment',
        description:
          'Scope a penetration testing engagement — tell me what you\'re building, what needs testing, and any deadline driving it. Replies within one business day.',
        path: '/contact/',
      }
    : { title: 'Contact', description: NOT_ACCEPTING_MESSAGE, path: '/contact/' },
);

export default function Contact() {
  if (!ACCEPTING_ENGAGEMENTS) {
    return (
      <div className="mx-auto max-w-3xl px-5 pt-32 pb-16 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">CONTACT</p>
        <h1 className="mt-3 font-mono text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {NOT_ACCEPTING_MESSAGE}
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-dim">
          The services and process pages stay up for reference.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pt-32 pb-16 sm:px-8">
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">CONTACT</p>
        <h1 className="mt-3 font-mono text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Request an assessment
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-dim">
          This starts a scoping conversation, not a purchase — nothing is tested until a written
          scope is agreed and signed. Tell me enough to have a useful first call: what you're
          building, what needs testing, and any deadline (audit, funding round, launch) attached
          to it.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-10">
          <QuoteForm />
        </div>
      </Reveal>

      <Reveal>
        <p className="mt-8 font-mono text-[12px] leading-relaxed text-ink-faint">
          <span className="text-red-blood/70">$</span> prefer email? {' '}
          <a href={`mailto:${MAILBOX.address}`} className="text-red-blood hover:underline">
            {MAILBOX.address}
          </a>{' '}
          reaches the same inbox. See how the engagement itself runs on the{' '}
          <a href="/process/" className="text-red-blood hover:underline">
            process page
          </a>
          .
        </p>
      </Reveal>
    </div>
  );
}
