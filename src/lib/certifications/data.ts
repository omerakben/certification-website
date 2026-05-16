import { CertificationsSchema, type Certification } from './schema';

const VERIFIED = '2026-05-15';

const rawCertifications = [
  {
    id: 1,
    provider: 'Google',
    name: 'Google IT Support Professional Certificate',
    description:
      'Entry-level program covering troubleshooting, networking, operating systems, and customer support. Coursera offers full financial aid that waives the fee.',
    link: 'https://www.coursera.org/professional-certificates/google-it-support',
    skills: ['IT Support', 'Troubleshooting', 'Networking', 'Linux', 'Customer Service'],
    verifiedFreeAt: VERIFIED,
    level: 'Beginner',
    duration: '6 months',
    lastUpdated: VERIFIED,
  },
  {
    id: 2,
    provider: 'Google',
    name: 'Google Data Analytics Professional Certificate',
    description:
      'Hands-on path through spreadsheets, SQL, R, and Tableau with case-study capstones. Coursera financial aid is available for the full certificate.',
    link: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    skills: ['Data Analysis', 'SQL', 'R', 'Tableau', 'Spreadsheets'],
    verifiedFreeAt: VERIFIED,
    level: 'Beginner',
    duration: '6 months',
    lastUpdated: VERIFIED,
  },
  {
    id: 3,
    provider: 'Microsoft',
    name: 'Microsoft Certified: Azure Fundamentals (AZ-900)',
    description:
      'Foundational Azure exam covering cloud concepts, core services, security, pricing, and governance. The full Learn path is free; exam vouchers are offered through Microsoft events.',
    link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/',
    skills: ['Cloud', 'Azure', 'Identity', 'Governance', 'Pricing'],
    verifiedFreeAt: VERIFIED,
    level: 'Beginner',
    duration: '10-12 hours',
    lastUpdated: VERIFIED,
  },
  {
    id: 4,
    provider: 'Microsoft',
    name: 'Microsoft Certified: Azure AI Fundamentals (AI-900)',
    description:
      'Free Microsoft Learn path covering machine learning, computer vision, NLP, and Azure AI services. Pairs well with the AI Engineer career trajectory.',
    link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/',
    skills: ['AI', 'Machine Learning', 'Azure AI', 'Computer Vision', 'NLP'],
    verifiedFreeAt: VERIFIED,
    level: 'Beginner',
    duration: '10 hours',
    lastUpdated: VERIFIED,
  },
  {
    id: 5,
    provider: 'Anthropic',
    name: 'Anthropic Courses: Prompt Engineering & Claude API',
    description:
      'Free interactive courses on prompt engineering, tool use, real-world applications, and the Claude API hosted on GitHub by Anthropic.',
    link: 'https://github.com/anthropics/courses',
    skills: ['Prompt Engineering', 'Claude API', 'Tool Use', 'AI Safety'],
    verifiedFreeAt: VERIFIED,
    level: 'Intermediate',
    duration: 'Self-paced',
    lastUpdated: VERIFIED,
  },
  {
    id: 6,
    provider: 'OpenAI',
    name: 'OpenAI Academy',
    description:
      'OpenAI Academy delivers free courses and live sessions on ChatGPT, the OpenAI API, and applied AI for professionals, educators, and developers.',
    link: 'https://academy.openai.com/',
    skills: ['ChatGPT', 'OpenAI API', 'Prompt Engineering', 'Generative AI'],
    verifiedFreeAt: VERIFIED,
    level: 'Intermediate',
    duration: 'Self-paced',
    lastUpdated: VERIFIED,
  },
  {
    id: 7,
    provider: 'AWS',
    name: 'AWS Cloud Practitioner Essentials',
    description:
      'AWS Skill Builder digital course covering core AWS services, pricing, security, and architectural concepts. Free with an AWS Builder account.',
    link: 'https://skillbuilder.aws/exam-prep/cloud-practitioner',
    skills: ['AWS', 'Cloud', 'IAM', 'EC2', 'S3'],
    verifiedFreeAt: VERIFIED,
    level: 'Beginner',
    duration: '6 hours',
    lastUpdated: VERIFIED,
  },
  {
    id: 8,
    provider: 'IBM',
    name: 'IBM SkillsBuild: Artificial Intelligence Fundamentals',
    description:
      'Free IBM SkillsBuild learning plan covering AI concepts, machine learning, neural networks, ethics, and a hands-on capstone with a digital credential.',
    link: 'https://skillsbuild.org/students/course-catalog/artificial-intelligence',
    skills: ['AI', 'Machine Learning', 'Neural Networks', 'AI Ethics'],
    verifiedFreeAt: VERIFIED,
    level: 'Beginner',
    duration: '20 hours',
    lastUpdated: VERIFIED,
  },
  {
    id: 9,
    provider: 'freeCodeCamp',
    name: 'Responsive Web Design Certification',
    description:
      'Project-based certification covering HTML, CSS, accessibility, and responsive layout. Five required projects unlock the free verified credential.',
    link: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    skills: ['HTML', 'CSS', 'Accessibility', 'Flexbox', 'Grid'],
    verifiedFreeAt: VERIFIED,
    level: 'Beginner',
    duration: '300 hours',
    lastUpdated: VERIFIED,
  },
  {
    id: 10,
    provider: 'freeCodeCamp',
    name: 'JavaScript Algorithms and Data Structures Certification',
    description:
      'Long-form curriculum on JavaScript fundamentals, ES6, regex, debugging, OOP, functional programming, and algorithm projects.',
    link: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
    skills: ['JavaScript', 'Algorithms', 'Data Structures', 'OOP', 'Functional Programming'],
    verifiedFreeAt: VERIFIED,
    level: 'Intermediate',
    duration: '300 hours',
    lastUpdated: VERIFIED,
  },
  {
    id: 11,
    provider: 'HubSpot',
    name: 'HubSpot Academy: Inbound Marketing Certification',
    description:
      'HubSpot Academy free certification on inbound methodology, content strategy, buyer personas, and conversational marketing.',
    link: 'https://academy.hubspot.com/courses/inbound-marketing',
    skills: ['Inbound Marketing', 'Content Strategy', 'SEO', 'Buyer Personas'],
    verifiedFreeAt: VERIFIED,
    level: 'Beginner',
    duration: '4 hours',
    lastUpdated: VERIFIED,
  },
  {
    id: 12,
    provider: 'HarvardX',
    name: 'CS50: Introduction to Computer Science',
    description:
      'Harvard\'s flagship CS course on edX. Free to audit, with a paid certificate option. Covers C, Python, SQL, web development, and algorithms.',
    link: 'https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science',
    skills: ['C', 'Python', 'SQL', 'Algorithms', 'Web Development'],
    verifiedFreeAt: VERIFIED,
    level: 'Beginner',
    duration: '12 weeks',
    lastUpdated: VERIFIED,
  },
];

function validateCertifications(input: unknown): Certification[] {
  const result = CertificationsSchema.safeParse(input);
  if (result.success) return result.data;

  const firstIssue = result.error.issues[0];
  const path = firstIssue?.path?.join('.') ?? '(unknown path)';
  // Surface the offending cert id (when known) to make data drift trivial to locate.
  const certIndex = typeof firstIssue?.path?.[0] === 'number' ? firstIssue.path[0] : null;
  const certId =
    certIndex !== null && Array.isArray(input) && input[certIndex] && typeof input[certIndex] === 'object'
      ? (input[certIndex] as { id?: unknown }).id
      : undefined;

  const idHint = certId !== undefined ? ` (cert id=${String(certId)})` : '';
  throw new Error(
    `Invalid certifications data${idHint} at ${path}: ${firstIssue?.message ?? 'unknown validation error'}`,
  );
}

export const Certifications: Certification[] = validateCertifications(rawCertifications);
