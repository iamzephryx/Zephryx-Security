import type { Metadata } from 'next';
import Link from 'next/link';
import { MAILBOX, PRIVACY_NOTICE_VERSION } from '@/lib/site';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy',
  description:
    'What happens to the information you submit through the scoping request and waitlist forms: what is collected, who handles it, and how to withdraw or delete it.',
  path: '/privacy/',
});

const H2 = 'font-mono text-lg font-semibold text-ink';

export default function Privacy() {
  const mail = (
    <a href={`mailto:${MAILBOX.address}`} className="font-mono text-red-blood hover:underline">
      {MAILBOX.address}
    </a>
  );

  return (
    <div className="mx-auto max-w-3xl px-5 pt-32 pb-16 sm:px-8">
      <p className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">PRIVACY</p>
      <h1 className="mt-3 font-mono text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        What happens to your data
      </h1>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink-dim">
        <p>
          This site does not run analytics, does not use tracking cookies, and does not load any
          third-party script. The only thing it collects is what you submit through the form on the{' '}
          <Link href="/contact/" className="text-red-blood hover:underline">
            contact page
          </Link>
          : a scoping request when new engagements are open, or a waitlist signup when they are
          paused.
        </p>

        <section>
          <h2 className={H2}>What&apos;s collected</h2>
          <p className="mt-3">
            <strong className="font-medium text-ink">Scoping request:</strong> your name, work email,
            company and website (optional), what you want tested, roughly how big it is, where
            testing would run, when you need results, anything you add in the notes field, your
            confirmation that you are authorised to approve testing the system, and a record of your
            consent (the time, and the version of this notice).
          </p>
          <p className="mt-3">
            <strong className="font-medium text-ink">Waitlist:</strong> your email, your name
            (optional), what you would want tested, and the same consent record.
          </p>
          <p className="mt-3">
            Your IP address is used to limit how many times one address can submit a form. It is held
            for about an hour for that purpose, and for a scoping request it is also included in the
            notification email sent to me. It is not saved with your request or your waitlist entry.
          </p>
        </section>

        <section>
          <h2 className={H2}>Why it&apos;s collected</h2>
          <p className="mt-3">
            A scoping request is used to reply to you and scope a possible engagement. A waitlist
            entry is used for one email when scheduling opens. You consent to this by ticking the box
            on the form, and you can withdraw that consent at any time (see below). Nothing you
            submit is sold, or used for marketing you didn&apos;t ask for.
          </p>
        </section>

        <section>
          <h2 className={H2}>Who handles it</h2>
          <p className="mt-3">
            The site and its storage run on Cloudflare. Cloudflare also answers a DNS lookup for the
            domain part of your email address, which is how the form catches typos. For a scoping
            request, the notification email that reaches me is delivered through Resend, so it passes
            through them. A waitlist signup is stored on Cloudflare only; no email is sent at signup.
          </p>
        </section>

        <section>
          <h2 className={H2}>Where it&apos;s stored</h2>
          <p className="mt-3">
            Submissions are stored to answer your request and are not retained beyond what&apos;s
            needed to do that. If an engagement moves forward, the details you shared become part of
            that engagement&apos;s records, governed by the NDA and scope agreement signed at that
            point — not by this page.
          </p>
        </section>

        <section>
          <h2 className={H2}>Withdrawing consent and deleting your data</h2>
          <p className="mt-3">
            Email {mail} and ask — to come off the waitlist, to withdraw a scoping request, or to
            have what you submitted deleted. This is a one-person operation, so that request goes
            straight to the person who can act on it, not a support queue.
          </p>
        </section>

        <p className="font-mono text-xs text-ink-dim">Notice version: {PRIVACY_NOTICE_VERSION}</p>
      </div>
    </div>
  );
}
