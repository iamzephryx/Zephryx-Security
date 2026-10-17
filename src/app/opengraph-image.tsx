import { ImageResponse } from 'next/og';
import { ACCEPTING_ENGAGEMENTS } from '@/lib/engagement';
import { SITE } from '@/lib/site';
import { MARK_FRAME, MARK_Z, MARK_COLORS } from '@/components/ZephryxMark';

/**
 * Static social-preview card. No dynamic params, so `output: 'export'` bakes
 * this into a plain PNG at build time.
 */
export const alt = `${SITE.name} — penetration testing for startups and businesses`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#06070a',
          backgroundImage:
            'linear-gradient(rgba(255,45,75,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,75,0.09) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            background:
              'radial-gradient(ellipse 90% 80% at 50% 45%, transparent 25%, rgba(6,7,10,0.75) 100%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid #1c2230',
            background: 'rgba(10,12,17,0.7)',
            padding: '8px 18px',
            color: '#98a1af',
            fontSize: 22,
            marginBottom: 30,
          }}
        >
          {ACCEPTING_ENGAGEMENTS && (
            <div style={{ width: 9, height: 9, borderRadius: 999, background: '#29d391', display: 'flex' }} />
          )}
          {ACCEPTING_ENGAGEMENTS ? 'AVAILABLE FOR NEW ENGAGEMENTS' : 'OFFENSIVE SECURITY'}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 108,
            fontWeight: 700,
            color: '#e8ebef',
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          <span style={{ display: 'flex', color: '#e8ebef' }}>ZEPHRYX</span>
          <span style={{ display: 'flex', color: '#ff2d4b' }}>/SECURITY</span>
        </div>

        <div style={{ display: 'flex', marginTop: 30, fontSize: 28, color: '#98a1af' }}>
          Penetration testing for startups and growing businesses
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 44,
            left: 64,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 24,
            color: '#5c6675',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 32 32" style={{ display: 'flex' }}>
            <path
              d={MARK_FRAME}
              fill="none"
              stroke={MARK_COLORS.frame}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d={MARK_Z}
              fill="none"
              stroke={MARK_COLORS.stroke}
              strokeWidth="2.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <span>{SITE.domain}</span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 44,
            right: 64,
            display: 'flex',
            fontSize: 22,
            color: '#5c6675',
          }}
        >
          web · network · cloud · AD · API
        </div>
      </div>
    ),
    { ...size },
  );
}
