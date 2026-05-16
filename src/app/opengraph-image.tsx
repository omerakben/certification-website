import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CertFinder: Free certifications, verified weekly';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
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
          background: 'linear-gradient(135deg, #2f64e0 0%, #1f4cc4 100%)',
          padding: 60,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: 'white',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 12.5l2.5 2.5L16 9.5"
                stroke="#2f64e0"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.02em',
            }}
          >
            CertFinder
          </div>
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.95)',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.25,
          }}
        >
          Free certifications from Google, Microsoft, AWS, and more
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          Verified weekly · Always free
        </div>
      </div>
    ),
    { ...size },
  );
}
