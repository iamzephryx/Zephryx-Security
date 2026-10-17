import Link from 'next/link';
import { MODE } from '@/lib/site';

/**
 * The primary call to action. Its label follows ENGAGEMENT.accepting (see MODE
 * in site.ts), so every button on the site changes with the flag at once.
 */
export default function Cta({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/contact/"
      className={`clip-tab inline-flex min-h-11 items-center gap-2 border border-red-deep bg-red-core px-7 py-3.5 font-mono text-sm font-medium text-void transition-all duration-300 hover:shadow-[0_0_30px_-4px_rgba(255,45,75,0.8)] ${className}`}
    >
      {MODE.cta}
    </Link>
  );
}
