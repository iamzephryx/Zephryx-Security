import Link from 'next/link';
import Cta from '@/components/Cta';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import {
  ENGAGEMENT,
  FAQ,
  GITHUB_URL,
  MAILBOX,
  MODE,
  PROCESS,
  PUBLIC_WORK,
  RULES,
  SERVICES,
  getPlan,
  priceFigure,
  startingPrice,
} from '@/lib/site';

const REPORT_CONTENTS = [
  'A one-page summary for leadership, in plain language.',
  'Every finding with its severity, the evidence, and the steps to reproduce it.',
  'A specific fix for each finding, written for your stack where I can.',
  'A detection note per finding: what your logs would show if someone used this path, and what alert would catch it.',
  'One retest of critical and high findings after you ship the fixes.',
];

const EXAMPLE_FINDING = [
  { label: 'Where', value: 'GET /api/orders/{id}', mono: true },
  {
    label: 'What happens',
    value:
      "Changing the order number in the request returns another customer's order. The server checks that you are logged in but not that the order is yours.",
  },
  {
    label: 'Impact',
    value: 'Names, addresses, and purchases of every customer are open to any account holder.',
  },
  {
    label: 'Fix',
    value:
      'Before returning an order, check on the server that it belongs to the requesting user. Do not rely on order numbers being hard to guess.',
  },
  {
    label: 'Detection',
    value:
      'Your logs show one session requesting many different order numbers in a short time. Alert when a single session reads an unusual number of distinct orders.',
  },
];

export default function Home() {
  const sheet = getPlan('web-focused');

  const sheetRows = [
    { label: 'Covers', value: sheet.covers },
    { label: 'User roles', value: sheet.roles ?? '' },
    { label: 'Method', value: 'Manual testing, not a scanner export' },
    { label: 'Delivery', value: sheet.delivery },
    { label: 'Includes', value: sheet.includes },
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-28 pb-16 sm:px-8 lg:min-h-[88vh] lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div>
          <Reveal>
            <p className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.3em] text-ink-dim">
              <span
                className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                  ENGAGEMENT.accepting ? 'animate-pulse bg-signal' : 'bg-warn'
                }`}
              />
              {MODE.eyebrow}
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-7 font-mono text-3xl font-bold leading-[1.15] tracking-tight text-ink sm:text-5xl">
              Penetration testing with a fixed scope, a fixed price, and fixes your developers can
              ship<span className="text-red-blood">.</span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-dim">
              I test web applications, APIs, external networks, and Active Directory for startups and
              growing businesses in India. You agree the scope and the price before any work starts,
              and you get a report that both your engineers and your leadership can read.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Cta />
              <Link
                href="/pricing/"
                className="inline-flex min-h-11 items-center gap-2 border border-line px-7 py-3.5 font-mono text-sm text-ink-dim transition-colors duration-300 hover:border-red-deep/60 hover:text-red-blood"
              >
                See pricing
                <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-dim">{MODE.heroNote}</p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <aside aria-label="Example scope sheet" className="panel clip-corner p-6 sm:p-7">
            <p className="font-mono text-[11px] tracking-[0.3em] text-ink-dim">EXAMPLE SCOPE SHEET</p>
            <h2 className="mt-2 font-mono text-xl font-semibold leading-snug text-ink">
              Web &amp; API assessment, {sheet.name}
            </h2>
            <dl className="mt-5">
              {sheetRows.map((r) => (
                <div
                  key={r.label}
                  className="grid gap-x-4 gap-y-1 border-t border-line py-3 text-sm sm:grid-cols-[6.5rem_1fr]"
                >
                  <dt className="text-ink-dim">{r.label}</dt>
                  <dd className="text-ink">{r.value}</dd>
                </div>
              ))}
              <div className="grid gap-x-4 gap-y-1 border-t-2 border-red-deep/70 pt-4 sm:grid-cols-[6.5rem_1fr]">
                <dt className="text-sm text-ink-dim">Price</dt>
                <dd>
                  {sheet.price.kind === 'from' ? (
                    <span className="font-mono text-sm text-ink-dim">From </span>
                  ) : null}
                  <span className="font-mono text-3xl font-bold tracking-tight text-ink">
                    {priceFigure(sheet.price)}
                  </span>
                  <div className="mt-1 text-sm text-ink-dim">{sheet.note}</div>
                </dd>
              </div>
            </dl>
          </aside>
        </Reveal>
      </section>

      {/* -------------------------------------------------------------- services */}
      <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8">
        <Reveal>
          <SectionHeading
            index="01 / SERVICES"
            title="What I test"
            sub="Four services. Each has a defined scope, so you know what you are buying and what it costs before we start."
          />
        </Reveal>

        <div className="grid gap-px border border-line bg-line">
          {SERVICES.map((s, i) => {
            const from = startingPrice(s.id);
            return (
              <Reveal key={s.id} delay={i * 50}>
                <Link
                  href={`/services/${s.id}/`}
                  className="group grid gap-x-10 gap-y-4 bg-surface p-6 transition-colors duration-300 hover:bg-elevated md:grid-cols-[1fr_1.7fr_9rem] md:items-start sm:p-7"
                >
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.3em] text-red-blood/70">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-2 font-mono text-[17px] font-semibold leading-snug text-ink">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-ink-dim">{s.scopeLine}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-dim">{s.summary}</p>
                  <div className="md:text-right">
                    <div className="text-sm text-ink-dim">{from.kind === 'from' ? 'From' : 'Price'}</div>
                    <div className="font-mono text-xl font-bold text-ink">{priceFigure(from)}</div>
                    <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-red-blood transition-transform duration-300 group-hover:translate-x-0.5">
                      details <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-ink-dim">
            I do not offer mobile app testing, cloud configuration reviews, social engineering, red
            team exercises, or reports formatted for regulators right now. If you need one of these, I
            will say so on the first call.
          </p>
          <p className="mt-4">
            <Link
              href="/pricing/"
              className="font-mono text-sm text-red-blood hover:underline"
            >
              Compare scopes and prices <span aria-hidden>→</span>
            </Link>
          </p>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- report */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal>
          <SectionHeading index="02 / REPORT" title="A report you can fix from" />
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <Reveal>
            <div>
              <p className="max-w-md text-[15px] leading-relaxed text-ink-dim">
                Every engagement ends with a written report and a live call with your team. The report
                contains:
              </p>
              <ul className="mt-6 space-y-3.5">
                {REPORT_CONTENTS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-dim">
                    <span className="mt-0.5 font-mono text-signal" aria-hidden>
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div>
              <p className="mb-3 text-sm text-ink-dim">
                Example finding from a lab application, not from a client
              </p>
              <article className="panel clip-corner p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm text-ink-dim">F-03</span>
                  <span className="border border-warn/50 bg-warn/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-warn">
                    High
                  </span>
                </div>
                <h3 className="mt-3 font-mono text-lg font-semibold leading-snug text-ink">
                  Any logged-in user can read other customers&apos; orders
                </h3>
                <dl className="mt-5">
                  {EXAMPLE_FINDING.map((r) => (
                    <div
                      key={r.label}
                      className="grid gap-x-4 gap-y-1 border-t border-line py-3 text-sm sm:grid-cols-[6.5rem_1fr]"
                    >
                      <dt className="text-ink-dim">{r.label}</dt>
                      <dd className={r.mono ? 'font-mono text-ink' : 'leading-relaxed text-ink'}>{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------------- process */}
      <section id="process" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8">
        <Reveal>
          <SectionHeading
            index="03 / PROCESS"
            title="How an engagement runs"
            sub="Five steps, in this order. You know what happens next at every point."
          />
        </Reveal>

        <div className="space-y-px border border-line bg-line">
          {PROCESS.map((step, i) => (
            <Reveal key={step.n} delay={i * 50}>
              <div className="flex flex-col gap-2 bg-surface p-6 sm:flex-row sm:items-baseline sm:gap-6">
                <span className="font-mono text-lg font-bold text-red-blood sm:w-10">{step.n}</span>
                <div>
                  <h3 className="font-mono text-base font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-dim">{step.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-6 text-sm text-ink-dim">
            Full breakdown on the{' '}
            <Link href="/process/" className="text-red-blood hover:underline">
              process page
            </Link>
            .
          </p>
        </Reveal>
      </section>

      {/* ------------------------------------------------- rules + who you hire */}
      <section className="mx-auto grid max-w-6xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal>
            <SectionHeading index="04 / RULES" title="Rules I work by" />
          </Reveal>
          <div className="space-y-px border border-line bg-line">
            {RULES.map((rule, i) => (
              <Reveal key={rule.title} delay={i * 50}>
                <div className="bg-surface p-5">
                  <h3 className="font-mono text-[15px] font-semibold text-ink">{rule.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{rule.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div>
          <Reveal>
            <SectionHeading index="OPERATOR" title="Who you are hiring" />
          </Reveal>
          <Reveal delay={60}>
            <div className="space-y-5 text-[15px] leading-relaxed text-ink-dim">
              <p>
                I am Zephryx. I run each engagement myself, so the person who scopes your test also
                performs it and writes the report. I also work on the defensive side, studying what
                attacks look like in logs, which is why every finding comes with a detection note.
              </p>
              <p>Read how I work before you decide:</p>
            </div>
            <ul className="mt-5 space-y-px border border-line bg-line">
              {PUBLIC_WORK.map((item) => (
                <li key={item.href} className="bg-surface">
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 transition-colors duration-300 hover:bg-elevated"
                  >
                    <span className="block break-words font-mono text-[13px] text-red-blood">
                      {item.label} <span aria-hidden>↗</span>
                    </span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-ink-dim">{item.blurb}</span>
                  </a>
                </li>
              ))}
              <li className="bg-surface">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 transition-colors duration-300 hover:bg-elevated"
                >
                  <span className="block break-words font-mono text-[13px] text-red-blood">
                    github.com/iamzephryx <span aria-hidden>↗</span>
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-ink-dim">
                    The open-source tools and projects.
                  </span>
                </a>
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------- FAQ */}
      <section id="faq" className="mx-auto max-w-4xl scroll-mt-20 px-5 py-20 sm:px-8">
        <Reveal>
          <SectionHeading
            index="05 / QUESTIONS"
            title="Questions buyers ask"
            sub="Something missing? Ask it on the scoping call."
          />
        </Reveal>

        <div className="space-y-px border border-line bg-line">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 40}>
              <details className="faq bg-surface p-6">
                <summary className="font-mono text-[15px] font-semibold text-ink">{item.q}</summary>
                <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-ink-dim">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------- CTA */}
      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="panel clip-corner flex flex-col items-start justify-between gap-6 border-line-hot bg-red-ash/10 p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-mono text-xl font-semibold text-ink">
                Tell me what you are building and what worries you about it.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-dim">{MODE.closingText}</p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3">
              <Cta />
              <span className="text-sm text-ink-dim">
                Or write to{' '}
                <a href={`mailto:${MAILBOX.address}`} className="font-mono text-red-blood hover:underline">
                  {MAILBOX.address}
                </a>
              </span>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
