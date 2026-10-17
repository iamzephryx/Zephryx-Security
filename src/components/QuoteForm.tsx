'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import {
  ENGAGEMENT,
  FORM_LIMITS,
  MAILBOX,
  NETWORK,
  REQUEST_OPTIONS,
  SERVICE_CHOICES,
  type Option,
} from '@/lib/site';

/* Caps come from FORM_LIMITS, the same constant the Worker reads, so the UI
   fails fast and identically. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'ok' }
  | { state: 'error'; msg: string };

/** One form or the other, fixed at build time by ENGAGEMENT.accepting. */
export default function QuoteForm() {
  return ENGAGEMENT.accepting ? <ScopingForm /> : <WaitlistForm />;
}

/* ------------------------------------------------------------ scoping request */

type ScopingFields = {
  name: string;
  email: string;
  company: string;
  service: string;
  size: string;
  environment: string;
  timeline: string;
  notes: string;
  authorised: boolean;
  consent: boolean;
};

type ScopingErrors = Partial<Record<'name' | 'email' | 'authorised' | 'consent', string>>;

function validateScoping(f: ScopingFields): ScopingErrors {
  const errors: ScopingErrors = {};
  if (f.name.trim().length < 2) errors.name = 'Tell me who you are (2+ characters).';
  if (!EMAIL_RE.test(f.email.trim())) errors.email = 'Enter a work email I can reply to.';
  if (!f.authorised) errors.authorised = 'Please confirm you are authorised to approve testing.';
  if (!f.consent) errors.consent = 'Please agree to be contacted about this request.';
  return errors;
}

function ScopingForm() {
  const [fields, setFields] = useState<ScopingFields>({
    name: '',
    email: '',
    company: '',
    service: SERVICE_CHOICES[0].id,
    size: REQUEST_OPTIONS.size[0].id,
    environment: REQUEST_OPTIONS.environment[0].id,
    timeline: REQUEST_OPTIONS.timeline[0].id,
    notes: '',
    authorised: false,
    consent: false,
  });
  const [errors, setErrors] = useState<ScopingErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const shell = useShell(status);

  const set =
    <K extends keyof ScopingFields>(k: K, max?: number) =>
    (value: ScopingFields[K]) => {
      const next = typeof value === 'string' && max ? (value.slice(0, max) as ScopingFields[K]) : value;
      setFields((f) => {
        const updated = { ...f, [k]: next };
        if (attempted) setErrors(validateScoping(updated));
        return updated;
      });
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.state === 'submitting') return;

    setAttempted(true);
    const found = validateScoping(fields);
    setErrors(found);
    const firstBad = (['name', 'email', 'authorised', 'consent'] as const).find((k) => found[k]);
    if (firstBad) {
      document.getElementById(`req-${firstBad}`)?.focus();
      return;
    }

    setStatus({ state: 'submitting' });
    const result = await send('/api/quote', {
      name: fields.name.trim(),
      email: fields.email.trim(),
      company: fields.company.trim(),
      service: fields.service,
      size: fields.size,
      environment: fields.environment,
      timeline: fields.timeline,
      notes: fields.notes.trim(),
      authorised: fields.authorised,
      consent: fields.consent,
      hp: shell.honeypotRef.current?.value ?? '',
      elapsedMs: Date.now() - shell.mountedAt.current,
    });
    setStatus(result);
  };

  if (status.state === 'ok') {
    return (
      <Done
        title="Request received"
        headingRef={shell.doneRef}
        body={`I will reply within ${ENGAGEMENT.replyWithin} to arrange the scoping call. If you do not hear from me by then, write to ${MAILBOX.address}.`}
      />
    );
  }

  const disabled = status.state === 'submitting';

  return (
    <form onSubmit={onSubmit} noValidate className="panel clip-corner relative overflow-hidden">
      <TitleBar label="scoping-request" />

      <div className="space-y-6 p-6 sm:p-8">
        <Honeypot inputRef={shell.honeypotRef} />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="req-name"
            label="Your name"
            value={fields.name}
            max={FORM_LIMITS.name}
            onChange={set('name', FORM_LIMITS.name)}
            error={errors.name}
            disabled={disabled}
            required
            autoComplete="name"
          />
          <TextField
            id="req-email"
            label="Work email"
            type="email"
            value={fields.email}
            max={FORM_LIMITS.email}
            onChange={set('email', FORM_LIMITS.email)}
            error={errors.email}
            disabled={disabled}
            required
            autoComplete="email"
          />
        </div>

        <TextField
          id="req-company"
          label="Company and website"
          value={fields.company}
          max={FORM_LIMITS.company}
          onChange={set('company', FORM_LIMITS.company)}
          disabled={disabled}
          autoComplete="organization"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="req-service"
            label="What do you want tested?"
            value={fields.service}
            options={SERVICE_CHOICES}
            onChange={set('service')}
            disabled={disabled}
          />
          <SelectField
            id="req-size"
            label="Roughly how big is it?"
            value={fields.size}
            options={REQUEST_OPTIONS.size}
            onChange={set('size')}
            disabled={disabled}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="req-environment"
            label="Where would testing run?"
            value={fields.environment}
            options={REQUEST_OPTIONS.environment}
            onChange={set('environment')}
            disabled={disabled}
          />
          <SelectField
            id="req-timeline"
            label="When do you need results?"
            value={fields.timeline}
            options={REQUEST_OPTIONS.timeline}
            onChange={set('timeline')}
            disabled={disabled}
          />
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <label htmlFor="req-notes" className="text-sm font-medium text-ink">
              Anything else I should know? <span className="font-normal text-ink-dim">(optional)</span>
            </label>
            <span className="font-mono text-xs text-ink-dim">
              {fields.notes.length} / {FORM_LIMITS.notes}
            </span>
          </div>
          <textarea
            id="req-notes"
            name="notes"
            rows={5}
            value={fields.notes}
            onChange={(e) => set('notes', FORM_LIMITS.notes)(e.target.value)}
            maxLength={FORM_LIMITS.notes}
            disabled={disabled}
            spellCheck
            className="w-full resize-y border border-line bg-void/70 p-3.5 text-base leading-relaxed text-ink focus:border-red-deep/70 disabled:opacity-60"
          />
        </div>

        <div className="space-y-4">
          <CheckField
            id="req-authorised"
            checked={fields.authorised}
            onChange={set('authorised')}
            error={errors.authorised}
            disabled={disabled}
          >
            I own this system, or I am authorised to approve testing it.
          </CheckField>
          <CheckField
            id="req-consent"
            checked={fields.consent}
            onChange={set('consent')}
            error={errors.consent}
            disabled={disabled}
          >
            I agree to be contacted about this request. My details are used only to reply to it, as
            described in the <PrivacyLink />.
          </CheckField>
        </div>

        <ResultRegion status={status} />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <SubmitButton disabled={disabled} idle="Send request" />
          <p className="text-sm text-ink-dim">
            Or write to{' '}
            <a href={`mailto:${MAILBOX.address}`} className="font-mono text-red-blood hover:underline">
              {MAILBOX.address}
            </a>
          </p>
        </div>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------- waitlist */

type WaitlistFields = { name: string; email: string; service: string; consent: boolean };
type WaitlistErrors = Partial<Record<'email' | 'consent', string>>;

function validateWaitlist(f: WaitlistFields): WaitlistErrors {
  const errors: WaitlistErrors = {};
  if (!EMAIL_RE.test(f.email.trim())) errors.email = 'Enter a work email I can reach you on.';
  if (!f.consent) errors.consent = 'Please agree to be emailed when scheduling opens.';
  return errors;
}

function WaitlistForm() {
  const [fields, setFields] = useState<WaitlistFields>({
    name: '',
    email: '',
    service: SERVICE_CHOICES[0].id,
    consent: false,
  });
  const [errors, setErrors] = useState<WaitlistErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const shell = useShell(status);

  const set =
    <K extends keyof WaitlistFields>(k: K, max?: number) =>
    (value: WaitlistFields[K]) => {
      const next = typeof value === 'string' && max ? (value.slice(0, max) as WaitlistFields[K]) : value;
      setFields((f) => {
        const updated = { ...f, [k]: next };
        if (attempted) setErrors(validateWaitlist(updated));
        return updated;
      });
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.state === 'submitting') return;

    setAttempted(true);
    const found = validateWaitlist(fields);
    setErrors(found);
    const firstBad = (['email', 'consent'] as const).find((k) => found[k]);
    if (firstBad) {
      document.getElementById(`wl-${firstBad}`)?.focus();
      return;
    }

    setStatus({ state: 'submitting' });
    const result = await send('/api/waitlist', {
      name: fields.name.trim(),
      email: fields.email.trim(),
      service: fields.service,
      consent: fields.consent,
      hp: shell.honeypotRef.current?.value ?? '',
      elapsedMs: Date.now() - shell.mountedAt.current,
    });
    setStatus(result);
  };

  if (status.state === 'ok') {
    return (
      <Done
        title="You are on the waitlist"
        headingRef={shell.doneRef}
        body="I will email you once when scheduling opens. Until then you can read how I work and what I charge."
      >
        <p className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium">
          <Link href="/pricing/" className="text-red-blood hover:underline">
            See pricing
          </Link>
          <a
            href={NETWORK[1].href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-blood hover:underline"
          >
            Read the writeups <span aria-hidden>↗</span>
          </a>
        </p>
      </Done>
    );
  }

  const disabled = status.state === 'submitting';

  return (
    <form onSubmit={onSubmit} noValidate className="panel clip-corner relative overflow-hidden">
      <TitleBar label="waitlist" />

      <div className="space-y-6 p-6 sm:p-8">
        <Honeypot inputRef={shell.honeypotRef} />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="wl-name"
            label="Your name"
            hint="optional"
            value={fields.name}
            max={FORM_LIMITS.name}
            onChange={set('name', FORM_LIMITS.name)}
            disabled={disabled}
            autoComplete="name"
          />
          <TextField
            id="wl-email"
            label="Work email"
            type="email"
            value={fields.email}
            max={FORM_LIMITS.email}
            onChange={set('email', FORM_LIMITS.email)}
            error={errors.email}
            disabled={disabled}
            required
            autoComplete="email"
          />
        </div>

        <SelectField
          id="wl-service"
          label="What would you want tested?"
          value={fields.service}
          options={SERVICE_CHOICES}
          onChange={set('service')}
          disabled={disabled}
        />

        <CheckField
          id="wl-consent"
          checked={fields.consent}
          onChange={set('consent')}
          error={errors.consent}
          disabled={disabled}
        >
          Email me when scheduling opens. I can unsubscribe at any time, and my details are handled as
          described in the <PrivacyLink />.
        </CheckField>

        <ResultRegion status={status} />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <SubmitButton disabled={disabled} idle="Join the waitlist" />
          <p className="text-sm text-ink-dim">
            Or write to{' '}
            <a href={`mailto:${MAILBOX.address}`} className="font-mono text-red-blood hover:underline">
              {MAILBOX.address}
            </a>
          </p>
        </div>
      </div>
    </form>
  );
}

/* --------------------------------------------------------------------- shared */

async function send(url: string, payload: Record<string, unknown>): Promise<Status> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.ok) return { state: 'ok' };
    return {
      state: 'error',
      msg: data?.error ?? `Send failed. Email ${MAILBOX.address} directly.`,
    };
  } catch {
    return {
      state: 'error',
      msg: `Network error. The channel may be offline — reach me at ${MAILBOX.address}.`,
    };
  }
}

/** Honeypot + time-trap refs, and focus management for the success screen. */
function useShell(status: Status) {
  // Bots fill hidden fields and submit instantly.
  const honeypotRef = useRef<HTMLInputElement>(null);
  const mountedAt = useRef<number>(Date.now());
  const doneRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status.state === 'ok') doneRef.current?.focus();
  }, [status.state]);

  return { honeypotRef, mountedAt, doneRef };
}

function TitleBar({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-line bg-elevated/70 px-4 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-red-blood/80" />
      <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-signal/70" />
      <span className="ml-3 font-mono text-[11px] tracking-wide text-ink-dim">
        zephryx@security — {label}
      </span>
    </div>
  );
}

function Honeypot({ inputRef }: { inputRef: React.Ref<HTMLInputElement> }) {
  // visually hidden, off the a11y tree, off tab order
  return (
    <div aria-hidden className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="hp-field">Leave this field empty</label>
      <input ref={inputRef} id="hp-field" name="hp" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

function PrivacyLink() {
  return (
    <Link href="/privacy/" className="text-red-blood underline-offset-2 hover:underline">
      privacy notice
    </Link>
  );
}

/** Both regions stay mounted so assistive tech is already watching them when the result lands. */
function ResultRegion({ status }: { status: Status }) {
  return (
    <>
      <div role="status" className="sr-only">
        {status.state === 'submitting' ? 'Sending' : ''}
      </div>
      <div
        role="alert"
        className="empty:m-0 border border-red-deep/40 bg-red-ash/10 px-4 py-3 text-sm text-red-blood empty:border-0 empty:p-0"
      >
        {status.state === 'error' ? status.msg : null}
      </div>
    </>
  );
}

function SubmitButton({ disabled, idle }: { disabled: boolean; idle: string }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="clip-tab inline-flex min-h-11 items-center gap-2 border border-red-deep bg-red-core px-7 py-3 font-mono text-sm font-medium text-void transition-all duration-300 hover:shadow-[0_0_30px_-4px_rgba(255,45,75,0.8)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {disabled ? (
        <>
          <span className="animate-blink">▌</span> Sending…
        </>
      ) : (
        idle
      )}
    </button>
  );
}

function Done({
  title,
  body,
  headingRef,
  children,
}: {
  title: string;
  body: string;
  headingRef: React.Ref<HTMLHeadingElement>;
  children?: ReactNode;
}) {
  return (
    <div role="status" className="panel clip-corner p-7 sm:p-9">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-mono text-2xl font-bold tracking-tight text-ink outline-none"
      >
        <span className="text-signal">✓</span> {title}
      </h2>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-dim">{body}</p>
      {children}
    </div>
  );
}

function FieldLabel({ htmlFor, label, hint }: { htmlFor: string; label: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-ink">
      {label}
      {hint ? <span className="font-normal text-ink-dim"> ({hint})</span> : null}
    </label>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p id={id} className="mt-1.5 text-sm text-red-blood">
      {error}
    </p>
  ) : null;
}

function TextField({
  id,
  label,
  hint,
  value,
  onChange,
  max,
  type = 'text',
  error,
  disabled,
  required,
  autoComplete,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  type?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} hint={hint} />
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={max}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        spellCheck={false}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="min-h-11 w-full border border-line bg-void/70 px-3.5 py-2.5 text-base text-ink focus:border-red-deep/70 disabled:opacity-60"
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} />
      <div className="relative">
        <select
          id={id}
          name={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="min-h-11 w-full appearance-none border border-line bg-void/70 py-2.5 pl-3.5 pr-10 text-base text-ink focus:border-red-deep/70 disabled:opacity-60"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-dim"
        >
          ▾
        </span>
      </div>
    </div>
  );
}

function CheckField({
  id,
  checked,
  onChange,
  error,
  disabled,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const errorId = `${useId()}-error`;
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-red-blood"
        />
        <label htmlFor={id} className="cursor-pointer text-[15px] leading-relaxed text-ink-dim">
          {children}
        </label>
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  );
}
