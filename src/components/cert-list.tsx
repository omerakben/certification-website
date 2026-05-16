import type { Certification } from '@/lib/certifications/schema';
import CertCard from './cert-card';

export default function CertList({
  certifications,
}: {
  certifications: Certification[];
}) {
  // Preserve first-seen provider order so the grouping feels stable across renders.
  const order: string[] = [];
  const grouped = new Map<string, Certification[]>();
  for (const cert of certifications) {
    const bucket = grouped.get(cert.provider);
    if (bucket) {
      bucket.push(cert);
    } else {
      order.push(cert.provider);
      grouped.set(cert.provider, [cert]);
    }
  }

  return (
    <div className="space-y-12">
      {order.map((provider) => {
        const certs = grouped.get(provider) ?? [];
        return (
          <section key={provider} aria-labelledby={`provider-${slugify(provider)}`}>
            <div className="mb-5 flex items-baseline justify-between gap-3">
              <h2
                id={`provider-${slugify(provider)}`}
                className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50"
              >
                {provider}
              </h2>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {certs.length} {certs.length === 1 ? 'certification' : 'certifications'}
              </span>
            </div>
            <ul
              role="list"
              className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            >
              {certs.map((cert) => (
                <li key={cert.id} className="h-full">
                  <CertCard certification={cert} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
