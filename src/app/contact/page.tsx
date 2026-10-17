import type { Metadata } from 'next';
import Link from 'next/link';
import { ENGAGEMENT, MAILBOX, MODE } from '@/lib/site';
import Reveal from '@/components/Reveal';
import QuoteForm from '@/components/QuoteForm';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: MODE.contactTitle,
  description: ENGAGEMENT.accepting
    ? `Ask for a free scoping call for a penetration test. Replies within ${ENGAGEMENT.replyWithin}, followed by a written proposal with a fixed scope and price.`
    : 'New engagements are paused. Join the waitlist and get one email when scheduling opens.',
  path: '/contact/',
});

const NEXT_STEPS = [
  `I read your request and reply within ${ENGAGEMENT.replyWithin}.`,
  'We hold a scoping call. It is free.',
  'You receive a written proposal with a fixed scope and price.',
  'Nothing starts until the proposal, the rules of engagement, and the NDA are signed.',
];

function Aside({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-mono text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-ink-dim">{children}</div>
    </div>
  );
}

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
    <div className="mx-auto grid max-w-6xl gap-14 px-5 pt-32 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
      <div>
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">CONTACT</p>
          <h1 className="mt-3 font-mono text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {MODE.contactTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-dim">{MODE.contactDescription}</p>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-10">
            <QuoteForm />
          </div>
        </Reveal>
      </div>

      <Reveal delay={120}>
        <aside className="space-y-9 lg:pt-[5.5rem]">
          {ENGAGEMENT.accepting ? (
            <Aside title="What happens next">
              <ol className="list-decimal space-y-3 pl-5 marker:font-mono marker:text-red-blood">
                {NEXT_STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </Aside>
          ) : (
            <Aside title="What the waitlist means">
              <p>
                I am not taking new engagements right now. When scheduling opens, people on the
                waitlist hear first, with the prices and slots available at that time.
              </p>
            </Aside>
          )}

          <Aside title="Before you send">
            <p>
              Request testing only for systems you own or are authorised to test. I ask for written
              authorisation from the system owner before any work starts.
            </p>
          </Aside>

          <Aside title="Prefer email?">
            <p>
              Write to{' '}
              <a href={`mailto:${MAILBOX.address}`} className="font-mono text-red-blood hover:underline">
                {MAILBOX.address}
              </a>{' '}
              with the same details. See{' '}
              <Link href="/pricing/" className="text-red-blood hover:underline">
                pricing
              </Link>{' '}
              for what each scope costs.
            </p>
          </Aside>
        </aside>
      </Reveal>
    </div>
  );
}
