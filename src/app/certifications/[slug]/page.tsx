import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CertDetail from '@/components/cert-detail';
import {
  getAllSlugs,
  getCertificationBySlug,
  getRelatedCertifications,
} from '@/lib/certifications/queries';

export const dynamic = 'force-static';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cert = getCertificationBySlug(slug);

  if (!cert) {
    return {
      title: 'Certification not found',
    };
  }

  return {
    title: cert.name,
    description: cert.description,
    alternates: {
      canonical: `/certifications/${cert.slug}`,
    },
    openGraph: {
      title: `${cert.name} · CertFinder`,
      description: cert.description,
      url: `/certifications/${cert.slug}`,
    },
  };
}

export default async function CertificationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cert = getCertificationBySlug(slug);

  if (!cert) notFound();

  return <CertDetail certification={cert} related={getRelatedCertifications(cert)} />;
}
