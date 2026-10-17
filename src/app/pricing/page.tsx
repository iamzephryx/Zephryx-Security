import type { Metadata } from 'next';
import Cta from '@/components/Cta';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import { buildMetadata } from '@/lib/metadata';
import {
  INCLUDED_IN_EVERY_ENGAGEMENT,
  MAILBOX,
  MODE,
  NOT_INCLUDED,
  getService,
  plansFor,
  priceFigure,
  type Plan,
} from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Pricing',
  description:
    'Fixed prices in Indian rupees, agreed before work starts: web and API assessment from a stated starting price, plus external network, Active Directory and detection review.',
  path: '/pricing/',
});

const WEB = 'web-application-penetration-testing';
const OTHER = [
  'network-infrastructure-penetration-testing',
  'active-directory-security-assessment',
  'purple-team-detection-engineering',
] as const;

const CALL_CHECKLIST = [
  'The applications, URLs, or IP ranges you want tested.',
  'The user roles in your product, such as customer, staff, and admin.',
  'API documentation or a Postman collection, if you have one.',
  'Whether a staging copy exists.',
  'What is driving the test: a customer request, an audit, a launch, or a funding round.',
];

function PlanColumn({ plan }: { plan: Plan }) {
  const rows = [
    { label: 'Covers', value: plan.covers },
    { label: 'User roles', value: plan.roles },
    { label: 'Environments', value: plan.environments },
    { label: 'Delivery', value: plan.delivery },
    { label: 'Includes', value: plan.includes },
  ];
  return (
    <div className="h-full bg-surface p-6 sm:p-7">
      <h3 className="font-mono text-xl font-semibold text-ink">{plan.name}</h3>
      <p className="mt-1.5 min-h-[3.2em] text-sm leading-relaxed text-ink-dim">{plan.blurb}</p>
      <div className="mt-5">
        {plan.price.kind === 'from' ? <div className="text-sm text-ink-dim">From</div> : null}
        <div className="font-mono text-3xl font-bold tracking-tight text-ink">{priceFigure(plan.price)}</div>
        <div className="mt-1 text-sm text-ink-dim">{plan.note}</div>
      </div>
      <dl className="mt-6">
        {rows.map((r) => (
          <div key={r.label} className="border-t border-line py-3">
            <dt className="text-xs text-ink-dim">{r.label}</dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Bullets({ items, mark }: { items: readonly string[]; mark: string }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-dim">
          <span className="mt-0.5 font-mono text-red-blood" aria-hidden>
            {mark}
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function Pricing() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 pb-16 sm:px-8">
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">PRICING</p>
        <h1 className="mt-3 max-w-3xl font-mono text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Fixed prices, agreed before work starts.
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-dim">
          Prices are in Indian rupees and exclude GST where it applies. The figure on this page is
          where a scope starts. After the scoping call, the proposal fixes the final number, and it
          changes only if you change the scope in writing.
        </p>
      </Reveal>

      {/* -------------------------------------------------------- web and API */}
      <section className="mt-20">
        <Reveal>
          <SectionHeading
            index="01 / WEB AND API"
            title={getService(WEB)?.title ?? 'Web and API assessment'}
            sub="Priced by how much there is to test. A screen is a distinct page or view in your application. An endpoint is a distinct API route."
          />
        </Reveal>
        <div className="grid gap-px border border-line bg-line md:grid-cols-3">
          {plansFor(WEB).map((plan, i) => (
            <Reveal key={plan.id} delay={i * 60}>
              <PlanColumn plan={plan} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ other services */}
      <section className="mt-20">
        <Reveal>
          <SectionHeading index="02 / OTHER" title="Other services" />
        </Reveal>
        <div className="space-y-px border border-line bg-line">
          {OTHER.flatMap((id) => plansFor(id)).map((plan, i) => (
            <Reveal key={plan.id} delay={i * 50}>
              <div className="grid gap-x-10 gap-y-3 bg-surface p-6 sm:p-7 md:grid-cols-[1fr_1.7fr_9rem]">
                <h3 className="font-mono text-[17px] font-semibold leading-snug text-ink">{plan.name}</h3>
                <div>
                  <p className="text-sm leading-relaxed text-ink-dim">{plan.blurb}</p>
                  <p className="mt-2 text-sm text-ink-dim">Delivery: {plan.delivery}</p>
                </div>
                <div className="md:text-right">
                  <div className="text-sm text-ink-dim">{plan.price.kind === 'from' ? 'From' : 'Price'}</div>
                  <div className="font-mono text-xl font-bold text-ink">{priceFigure(plan.price)}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ included / not included */}
      <section className="mt-20 grid gap-14 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHeading index="03 / INCLUDED" title="Included in every engagement" />
          <Bullets items={INCLUDED_IN_EVERY_ENGAGEMENT} mark="✓" />
        </Reveal>
        <Reveal delay={60}>
          <SectionHeading index="04 / EXCLUDED" title="Not included" />
          <Bullets items={NOT_INCLUDED} mark="–" />
        </Reveal>
      </section>

      {/* ------------------------------------------------------ how the price is set */}
      <section className="mt-20 grid gap-14 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHeading index="05 / METHOD" title="How the price is set" />
          <div className="max-w-xl space-y-4 text-[15px] leading-relaxed text-ink-dim">
            <p>
              Price follows three things: the number of screens or endpoints, the number of user
              roles, and the number of environments. We count them together on the scoping call, so
              there is no hourly billing and no surprise invoice.
            </p>
            <p>
              If the scope changes after kickoff, we agree the change and its cost in writing before
              I do any extra work. Payment terms are written into the proposal before you sign.
            </p>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <SectionHeading index="06 / PREPARE" title="Bring this to the scoping call" />
          <Bullets items={CALL_CHECKLIST} mark="+" />
        </Reveal>
      </section>

      {/* ------------------------------------------------------------------ CTA */}
      <Reveal>
        <section className="panel clip-corner mt-24 flex flex-col items-start justify-between gap-6 border-line-hot bg-red-ash/10 p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="max-w-xl font-mono text-xl font-semibold text-ink">
              Not sure which scope fits? Describe what you have and I will tell you.
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
        </section>
      </Reveal>
    </div>
  );
}
