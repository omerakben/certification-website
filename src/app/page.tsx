import Hero from '@/components/hero';
import CertExplorer from '@/components/cert-explorer';
import { Certifications } from '@/lib/certifications/data';

export const dynamic = 'force-static';
export const revalidate = 86400;

export default function HomePage() {
  const certCount = Certifications.length;
  const providerCount = new Set(Certifications.map((c) => c.provider)).size;
  const lastVerified =
    Certifications.reduce<string>(
      (acc, c) => (c.lastUpdated && c.lastUpdated > acc ? c.lastUpdated : acc),
      '',
    ) || Certifications[0]?.verifiedFreeAt || '';

  return (
    <main id="main" className="bg-aurora">
      <Hero providerCount={providerCount} certCount={certCount} lastVerified={lastVerified} />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <CertExplorer initialCertifications={Certifications} />
      </section>
    </main>
  );
}
