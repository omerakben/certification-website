import type { Metadata } from 'next';
import PathBuilder from '@/components/path-builder';
import { Certifications } from '@/lib/certifications/data';

export const dynamic = 'force-static';

const TITLE = 'Build my free path';
const DESCRIPTION =
  'Answer three questions and get a ranked free-certification roadmap with week-by-week sequencing. Share the URL and a friend sees the same plan.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/builder',
  },
  openGraph: {
    title: `${TITLE} · CertFinder`,
    description: DESCRIPTION,
    url: '/builder',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} · CertFinder`,
    description: DESCRIPTION,
  },
};

export default function BuilderPage() {
  return (
    <main id="main" className="bg-aurora">
      <PathBuilder certifications={Certifications} />
    </main>
  );
}
