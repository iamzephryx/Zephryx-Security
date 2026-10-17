import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Reveal from '@/components/Reveal';
import Cta from '@/components/Cta';
import { getService, plansFor, priceFigure, SERVICES } from '@/lib/site';
import { buildMetadata } from '@/lib/metadata';

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return buildMetadata({
    title: service.title,
    description: service.summary,
    path: `/services/${service.id}/`,
  });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const idx = SERVICES.findIndex((s) => s.id === service.id);

  return (
    <div className="mx-auto max-w-4xl px-5 pt-32 pb-16 sm:px-8">
      <Reveal>
        <Link
          href="/services/"
          className="mb-5 inline-block font-mono text-[12px] text-ink-dim transition-colors hover:text-red-blood"
        >
          ← all services
        </Link>
        <p className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">
          SERVICE {String(idx + 1).padStart(2, '0')} / {SERVICES.length}
        </p>
        <h1 className="mt-3 font-mono text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {service.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-dim">{service.tagline}</p>
      </Reveal>

      <Reveal delay={60}>
        <div className="mt-8 max-w-2xl space-y-4 text-[15px] leading-relaxed text-ink-dim">
          <p>{service.summary}</p>
          <p>{service.description}</p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2">
        <Reveal>
          <div className="h-full bg-surface p-6">
            <h2 className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">IDEAL FOR</h2>
            <ul className="mt-4 space-y-2.5">
              {service.idealFor.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-dim">
                  <span className="mt-0.5 font-mono text-red-blood">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="h-full bg-surface p-6">
            <h2 className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">DELIVERABLES</h2>
            <ul className="mt-4 space-y-2.5">
              {service.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-dim">
                  <span className="mt-0.5 font-mono text-signal">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <section className="mt-10">
          <h2 className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">IN SCOPE</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {service.inScope.map((item) => (
              <li
                key={item}
                className="panel px-4 py-3 text-[13px] leading-relaxed text-ink-dim"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-10">
          <h2 className="font-mono text-[11px] tracking-[0.3em] text-red-blood/70">SCOPE AND PRICE</h2>
          <div className="mt-5 grid gap-px border border-line bg-line">
            {plansFor(service.id).map((plan) => (
              <div
                key={plan.id}
                className="grid gap-x-8 gap-y-2 bg-surface p-5 text-sm sm:grid-cols-[1fr_1.5fr_auto] sm:items-baseline"
              >
                <div className="font-mono font-semibold text-ink">{plan.name}</div>
                <div className="leading-relaxed text-ink-dim">
                  {plan.covers}
                  <span className="block">Delivery: {plan.delivery}</span>
                </div>
                <div className="font-mono sm:text-right">
                  {plan.price.kind === 'from' ? <span className="text-ink-dim">From </span> : null}
                  <span className="text-lg font-bold text-ink">{priceFigure(plan.price)}</span>
                  <span className="block text-xs text-ink-dim">{plan.note}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="panel clip-corner mt-14 p-7">
          <h2 className="font-mono text-lg font-semibold text-ink">Scope {service.short}</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-dim">
            Every engagement starts with a scoping call. The scope and the final price are fixed in a
            written proposal before any work begins.
          </p>
          <Cta className="mt-6" />
        </section>
      </Reveal>

      <p className="mt-10 font-mono text-[12px] text-ink-faint">
        <Link href="/services/" className="text-red-blood/80 hover:text-red-blood">
          ← all services
        </Link>
      </p>
    </div>
  );
}
