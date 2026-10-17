import { ACCEPTING_ENGAGEMENTS, NOT_ACCEPTING_MESSAGE } from '@/lib/engagement';

/** Renders nothing while engagements are open, so call sites need no condition. */
export default function EngagementNotice({ className = '' }: { className?: string }) {
  if (ACCEPTING_ENGAGEMENTS) return null;
  return (
    <div
      role="status"
      className={`border border-red-deep/70 bg-red-ash/25 px-4 py-3 font-mono text-[13px] text-ink ${className}`}
    >
      <span className="text-red-blood/70" aria-hidden>
        !{' '}
      </span>
      {NOT_ACCEPTING_MESSAGE}
    </div>
  );
}
