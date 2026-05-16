import { Certifications } from '@/lib/certifications/data';
import type { Certification } from '@/lib/certifications/schema';
import { SITE_URL } from '@/lib/site';

interface CourseOffer {
  '@type': 'Offer';
  price: '0';
  priceCurrency: 'USD';
  availability: 'https://schema.org/InStock';
}

interface CourseSchema {
  '@type': 'Course';
  name: string;
  description: string;
  url: string;
  sameAs: string[];
  provider: {
    '@type': 'Organization';
    name: string;
  };
  offers?: CourseOffer;
  educationalLevel?: string;
  timeRequired?: string;
  teaches?: string[];
}

interface ListItemSchema {
  '@type': 'ListItem';
  position: number;
  item: CourseSchema;
}

interface ItemListSchema {
  '@context': 'https://schema.org';
  '@type': 'ItemList';
  name: string;
  description: string;
  numberOfItems: number;
  itemListElement: ListItemSchema[];
}

function buildCourseSchema(cert: Certification): CourseSchema {
  const course: CourseSchema = {
    '@type': 'Course',
    name: cert.name,
    description: cert.description,
    url: `${SITE_URL}/certifications/${cert.slug}`,
    sameAs: [cert.link],
    provider: {
      '@type': 'Organization',
      name: cert.provider,
    },
  };

  if (
    cert.freeAccess.type === 'free-certificate' ||
    cert.freeAccess.type === 'free-badge' ||
    cert.freeAccess.type === 'free-course-paid-certificate'
  ) {
    course.offers = {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    };
  }

  if (cert.level) course.educationalLevel = cert.level;
  if (cert.duration) course.timeRequired = cert.duration;
  if (cert.skills.length > 0) course.teaches = cert.skills;

  return course;
}

export default function StructuredData() {
  const payload: ItemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Free Certification Programs',
    description: 'Hand-curated directory of free certifications verified weekly',
    numberOfItems: Certifications.length,
    itemListElement: Certifications.map((cert, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: buildCourseSchema(cert),
    })),
  };

  // JSON.stringify is XSS-safe for JSON-LD scripts because the payload is built
  // from the static, build-time `Certifications` dataset and never contains
  // user input. We also strip the `</` sequence defensively to be robust
  // against any future content that might include a literal closing script tag.
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
