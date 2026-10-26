/**
 * Fallback and seed content. Supabase is the production source of truth.
 */

const STORAGE_BASE =
  'https://czmpwatylyfhsjggdsiu.supabase.co/storage/v1/object/public/portfolio-media';

export interface MediaAsset {
  src: string;
  alt: string;
  storagePath?: string;
}

export interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  initials: string;
  role: string;
  years: string;
  location: string;
  email: string;
  phone: string;
  availability: string;
  tagline: string;
  heroImage: MediaAsset;
  aboutImage: MediaAsset;
}

export interface NavLink {
  label: string;
  target: string;
}

export interface AboutContent {
  statement: string;
  paragraphs: string[];
  stats: { value: string; label: string }[];
  descriptors: string[];
  languages: string[];
}

export interface SkillGroup {
  title: string;
  items: string[];
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface PortfolioContent {
  profile: Profile;
  navLinks: NavLink[];
  marqueeItems: string[];
  about: AboutContent;
  experience: ExperienceItem[];
  projects: Project[];
  skillGroups: SkillGroup[];
  socials: SocialLink[];
}

function storageAsset(path: string, alt: string): MediaAsset {
  return {
    src: `${STORAGE_BASE}/${path}`,
    alt,
    storagePath: path,
  };
}

export const PROFILE: Profile = {
  name: 'Sazzad Hossain',
  firstName: 'Sazzad',
  lastName: 'Hossain',
  initials: 'SH',
  role: 'Lead UI Engineer',
  years: '16+',
  location: 'Dhaka, Bangladesh',
  email: 'rshossain.bd@gmail.com',
  phone: '+880 1713 204 761',
  availability: 'Open to new opportunities',
  tagline:
    'UI developer from Bangladesh, crafting clean & user-friendly experiences with quality and best practices.',
  heroImage: storageAsset('profile/portrait-hero.jpg', 'Sazzad Hossain'),
  aboutImage: storageAsset('profile/portrait-about.jpg', 'Sazzad Hossain at work'),
};

export const NAV_LINKS: NavLink[] = [
  { label: 'About', target: '#about' },
  { label: 'Experience', target: '#experience' },
  { label: 'Work', target: '#work' },
  { label: 'Contact', target: '#contact' },
];

export const MARQUEE_ITEMS = [
  'Angular',
  'Tailwind CSS',
  'SCSS',
  'TypeScript',
  'JavaScript',
  'HTML5',
  'CSS3',
  'Bootstrap',
  'Figma',
  'Responsive Design',
];

export const ABOUT: AboutContent = {
  statement:
    'For over sixteen years I have been turning designs into interfaces people enjoy using — pixel-perfect, responsive, and quietly refined.',
  paragraphs: [
    'I specialise in frontend and UI engineering: implementing wireframes and designs from Figma, InVision or Zeplin into clean, SEO-friendly, responsive templates — then wiring them into frameworks and CMS platforms like Angular, nopCommerce and WordPress.',
    'These days I lead UI engineering at Brain Station 23, building with Angular, Tailwind CSS and Angular Material, prototyping in Figma, and keeping the bar high on quality and best practices — inside a strongly agile, scrum-driven workflow.',
  ],
  stats: [
    { value: '16+', label: 'Years shipping product' },
    { value: '5', label: 'Frameworks & CSS stacks' },
    { value: '4', label: 'Companies, two continents of clients' },
    { value: '100%', label: 'Responsive, always' },
  ],
  descriptors: ['UI Engineer', 'Design Translator', 'Problem Solver', 'Pixel Perfectionist', 'Scrum Regular'],
  languages: ['Bangla — native', 'English — fluent'],
};

export interface ExperienceItem {
  era: 'Now' | 'Then';
  period: string;
  role: string;
  company: string;
  note: string;
  tags: string[];
}

export const EXPERIENCE: ExperienceItem[] = [
  {
    era: 'Now',
    period: '2016 — Present',
    role: 'Lead UI Engineer',
    company: 'Brain Station 23 PLC',
    note: 'Implementing wireframes (Figma, InVision, Zeplin) and PSDs into responsive, SEO-friendly templates. Building UIs with Bootstrap, Angular Material and Tailwind CSS, and integrating themes with Angular, nopCommerce and WordPress. Testing UI/UX feasibility and shipping solutions from user feedback.',
    tags: ['Angular', 'Tailwind CSS', 'Design Systems', 'Figma'],
  },
  {
    era: 'Now',
    period: '2013 — 2016',
    role: 'Software Engineer',
    company: 'Blueliner Digital Ltd.',
    note: 'PSD-to-HTML conversion with responsive behaviour, cross-browser compatibility fixes, and project management with Git, Bitbucket and JIRA.',
    tags: ['HTML/CSS', 'Responsive', 'Git'],
  },
  {
    era: 'Then',
    period: '2011 — 2013',
    role: 'Software Engineer',
    company: 'Codemen Solution Inc.',
    note: 'Dynamic websites with PHP, MySQL and jQuery. Custom W3C-validated WordPress themes and CMS builds on Joomla and Magento, with SEO baked in.',
    tags: ['PHP', 'WordPress', 'jQuery'],
  },
  {
    era: 'Then',
    period: '2009 — 2011',
    role: 'Web Developer',
    company: 'Uranus BD',
    note: 'Developed and maintained dynamic PHP websites across several CMSs, designed databases per project requirements, and customised web templates.',
    tags: ['PHP', 'MySQL', 'CMS'],
  },
];

export interface CaseStudy {
  problem?: string;
  decisions?: string[];
  result?: string;
  role: string;
  overview: string;
  highlights: string[];
}

export interface Project {
  slug?: string;
  index: string;
  title: string;
  category: string;
  year: string;
  description: string;
  stack: string[];
  url?: string;
  images: MediaAsset[];
  palette: { base: string; orb: string; orb2: string };
  wide: boolean;
  caseStudy: CaseStudy;
}

export const PROJECTS: Project[] = [
  {
    index: '01',
    title: 'Styloviz',
    category: 'UI Library',
    year: '2026',
    description:
      'An Angular UI ecosystem built around a shared data-state contract: reusable components, runnable application templates and live documentation, with backend integration treated as part of the product.',
    stack: ['Angular 21 & 22', 'Tailwind CSS 4', 'TypeScript', 'npm'],
    url: 'https://styloviz.dev',
    images: [
      storageAsset('work/styloviz-1.webp', 'Styloviz — backend-ready component overview'),
      storageAsset('work/styloviz-2.webp', 'Styloviz — shared data-state architecture'),
      storageAsset('work/styloviz-3.webp', 'Styloviz — interactive component playground'),
    ],
    palette: { base: '#08101f', orb: '#2563eb', orb2: '#06b6d4' },
    wide: true,
    caseStudy: {
      role: 'Creator & Lead Engineer',
      overview:
        'I created Styloviz to bring interface design and application behaviour into one Angular ecosystem. The work spans reusable components, backend integration patterns, runnable templates, documentation and an interactive playground.',
      problem:
        'Real application data can arrive late, fail or return nothing. Teams need to connect their APIs, preserve user input and keep interactions consistent across different screens. Styloviz brings those integration needs into the component design.',
      decisions: [
        'Kept components independent of HTTP and a specific backend. Shared query, page, error and item-identity types let applications use their existing data layer; the data adapter remains optional.',
        'Made loading, error, retry and empty states part of the component contract. Request guards, cancellation and keyed rows handle changing queries without accepting stale responses or losing row identity.',
        'Used the same components in runnable templates and interactive documentation. Examples expose failure states as well as successful data, so integration behaviour can be inspected before adoption.',
      ],
      result:
        'Delivered a live ecosystem of 169 components and 21 runnable application templates, supported by integration guides and an interactive playground. It provides a reusable foundation for building data-driven Angular interfaces.',
      highlights: [
        'Angular 21 and 22 support, standalone components, Signals, OnPush and strict TypeScript',
        'An optional data adapter for query debouncing, cancellation and status-aware retries',
        'Shared state handling without third-party runtime dependencies beyond the Angular and Tailwind foundation',
        'Public Free and Pro packages, documentation, templates and inspectable component examples',
      ],
    },
  },
  {
    index: '02',
    title: 'ngCommerce',
    category: 'E-commerce',
    year: '2024',
    description:
      'A modular Angular storefront connecting category browsing, product search and cart access with shared catalogue caching, lazy images and explicit loading and retry states.',
    stack: ['Angular', 'RxJS', 'Bootstrap', 'CSS3'],
    url: 'https://ngcommerce.rshossain.me',
    images: [
      storageAsset('work/ngc-1.jpg', 'ngCommerce — screen 1'),
      storageAsset('work/ngc-2.jpg', 'ngCommerce — screen 2'),
      storageAsset('work/ngc-3.jpg', 'ngCommerce — screen 3'),
    ],
    palette: { base: '#141210', orb: '#b0704f', orb2: '#9f4920' },
    wide: true,
    caseStudy: {
      role: 'Lead UI Engineer',
      overview:
        'I led the UI engineering for ngCommerce, bringing category navigation, catalogue search and cart access into a shared Angular storefront. The work combines reusable shopping interfaces with data services and image-loading behaviour.',
      problem:
        'Catalogue screens need to handle repeated navigation, large images and incomplete responses while keeping shopping controls understandable. Search, category selection and cart access need consistent feedback as data loads or becomes unavailable.',
      decisions: [
        'Used shared catalogue services with expiry-based caching. Repeated category requests can reuse recent data, while an expiry boundary allows the application to request a newer response.',
        'Deferred product-image loading with IntersectionObserver and supplied an image fallback. Image work starts as cards approach the viewport instead of loading every catalogue image immediately.',
        'Kept category navigation, search and cart access in a consistent storefront shell. Loading, empty and retry states explain when catalogue content is not yet available.',
      ],
      result:
        'Delivered a modular storefront interface with category discovery, search, price filters and cart access. Shared caching and lazy image loading provide reusable integration patterns for catalogue screens.',
      highlights: [
        'Angular shopping interfaces with reusable catalogue services',
        'Expiry-based category caching with a shared cache boundary',
        'IntersectionObserver product-image loading and image fallbacks',
        'Category and price filters, empty-state messaging and explicit retry actions',
      ],
    },
  },
  {
    index: '03',
    title: 'Nop Kalles',
    category: 'E-commerce',
    year: '2023',
    description:
      'A fashion storefront theme for nopCommerce, bringing campaign imagery, catalogue filters and product selection into a consistent visual system.',
    stack: ['nopCommerce', 'Razor', 'SCSS', 'JavaScript'],
    images: [
      storageAsset('work/kalles-1.jpg', 'Nop Kalles — screen 1'),
      storageAsset('work/kalles-2.jpg', 'Nop Kalles — screen 2'),
      storageAsset('work/kalles-3.jpg', 'Nop Kalles — screen 3'),
    ],
    palette: { base: '#121412', orb: '#788c8c', orb2: '#b0704f' },
    wide: false,
    caseStudy: {
      role: 'UI Engineer',
      overview:
        'My UI work on Nop Kalles focused on the shopping journey from a seasonal campaign to a catalogue and product detail page. Large photography, restrained typography and a shared palette connect the editorial presentation with practical shopping controls.',
      problem:
        'A fashion storefront needs to communicate the collection while making individual products easy to compare and configure. Campaign imagery, catalogue filters and purchase controls need a clear hierarchy so the presentation supports the shopping task.',
      decisions: [
        'Gave campaign and product photography the largest visual areas, with restrained type and muted accents. Collection links and product prices remain distinct within that hierarchy.',
        'Placed category, size, colour and price controls beside the catalogue grid. Product cards use a consistent image, name and price pattern to support comparison.',
        'Grouped price, colour, size, quantity and the add-to-cart control beside the product gallery. Supporting description and shipping information sit below the primary purchase controls.',
      ],
      result:
        'Created a consistent fashion-storefront presentation across the homepage, catalogue and product detail layouts. The project connects collection discovery, product comparison and item selection within one visual system.',
      highlights: [
        'Campaign-led homepage with collection links and a product grid',
        'Catalogue layout with category, size, colour and price controls',
        'Product gallery with thumbnails and a clearly grouped purchase panel',
        'Shared typography, spacing and muted accents across the storefront',
      ],
    },
  },
  {
    index: '04',
    title: 'Fortune',
    category: 'E-commerce',
    year: '2022',
    description:
      'A jewellery storefront interface combining dark product photography, gold accents, collection filters and a focused product-selection layout.',
    stack: ['HTML5', 'Tailwind CSS', 'JavaScript'],
    images: [
      storageAsset('work/fortune-1.jpg', 'Fortune — screen 1'),
      storageAsset('work/fortune-2.jpg', 'Fortune — screen 2'),
      storageAsset('work/fortune-3.jpg', 'Fortune — screen 3'),
    ],
    palette: { base: '#131118', orb: '#a697c6', orb2: '#788c8c' },
    wide: false,
    caseStudy: {
      role: 'UI Engineer',
      overview:
        'My UI work on Fortune brings jewellery discovery and product selection into a consistent storefront presentation. A dark palette and large product imagery carry the brand, while collection controls and purchase information give each page a practical structure.',
      problem:
        'Jewellery needs close visual inspection alongside clear information about price, material and available options. The interface needs to balance that detail with a distinct brand presentation across collection and product pages.',
      decisions: [
        'Used dark backgrounds and gold accents across navigation, product cards and actions. Large photography and restrained supporting text keep the jewellery prominent within the page hierarchy.',
        'Placed price, material and length controls beside the collection grid, with a separate sorting control. Repeated image, name and price patterns make the available pieces easier to compare.',
        'Grouped metal selection, quantity and the purchase action beside the product gallery. Product details, shipping and care information sit in secondary sections beneath those controls.',
      ],
      result:
        'Created a cohesive jewellery-storefront presentation across the homepage, collection and product detail layouts. A shared visual language connects category discovery, product comparison and selection of an individual piece.',
      highlights: [
        'Campaign homepage with jewellery categories and new-arrival cards',
        'Collection layout with price, material, length and sorting controls',
        'Product gallery and purchase panel with metal and quantity selection',
        'Consistent dark surfaces, gold accents and product-led typography',
      ],
    },
  },
  {
    index: '05',
    title: 'My Realty',
    category: 'Real Estate',
    year: '2022',
    description:
      'Property listing platform UI: search and filtering for large datasets, map-ready listing cards and agent detail pages.',
    stack: ['Angular', 'SCSS', 'REST API'],
    images: [
      storageAsset('work/realty-1.jpg', 'My Realty — screen 1'),
      storageAsset('work/realty-2.jpg', 'My Realty — screen 2'),
      storageAsset('work/realty-3.jpg', 'My Realty — screen 3'),
    ],
    palette: { base: '#101312', orb: '#788c8c', orb2: '#9f4920' },
    wide: true,
    caseStudy: {
      role: 'UI Engineer',
      overview:
        'A property listing platform UI where search is the product. Built to stay responsive while filtering large datasets, with map-ready listing cards and agent pages that build trust.',
      highlights: [
        'Angular search and filtering over large property datasets without jank',
        'Map-ready listing cards with price badges and bed/bath iconography',
        'Agent detail pages designed to convert browsers into enquiries',
        'REST API integration with optimistic UI updates on saved searches',
      ],
    },
  },
  {
    index: '06',
    title: 'Blueliner',
    category: 'Corporate',
    year: '2015',
    description:
      'Corporate site for a digital agency — pixel-perfect PSD implementation with smooth scroll interactions and cross-browser polish.',
    stack: ['HTML5', 'CSS3', 'jQuery'],
    images: [
      storageAsset('work/blueliner-1.jpg', 'Blueliner — screen 1'),
      storageAsset('work/blueliner-2.jpg', 'Blueliner — screen 2'),
      storageAsset('work/blueliner-3.jpg', 'Blueliner — screen 3'),
    ],
    palette: { base: '#121214', orb: '#4d65ff', orb2: '#788c8c' },
    wide: false,
    caseStudy: {
      role: 'Software Engineer',
      overview:
        'Corporate site for a digital agency — pixel-perfect PSD implementation with smooth scroll interactions and cross-browser polish, back when IE11 still had opinions.',
      highlights: [
        'Pixel-perfect PSD-to-HTML implementation verified against design overlays',
        'Smooth scroll interactions and reveal animations in vanilla JS + jQuery',
        'Cross-browser QA matrix covering legacy IE through modern browsers',
        'W3C-validated, SEO-friendly markup throughout',
      ],
    },
  },
  {
    index: '07',
    title: 'Kids Toys',
    category: 'E-commerce',
    year: '2014',
    description:
      'A playful storefront theme with bright, accessible components and a checkout flow simple enough for busy parents.',
    stack: ['WordPress', 'PHP', 'CSS3'],
    images: [
      storageAsset('work/kids-1.jpg', 'Kids Toys — screen 1'),
      storageAsset('work/kids-2.jpg', 'Kids Toys — screen 2'),
      storageAsset('work/kids-3.jpg', 'Kids Toys — screen 3'),
    ],
    palette: { base: '#141110', orb: '#9f4920', orb2: '#a697c6' },
    wide: false,
    caseStudy: {
      role: 'Software Engineer',
      overview:
        'A playful storefront theme with bright, accessible components and a checkout flow simple enough for busy parents shopping one-handed.',
      highlights: [
        'Custom WordPress theme with a component library of rounded, friendly UI',
        'WooCommerce integration with simplified, distraction-free checkout',
        'Accessible colour contrast and focus states despite the playful palette',
        'Age-range filtering so parents find suitable toys in two clicks',
      ],
    },
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Core',
    items: ['HTML5', 'CSS3', 'SCSS', 'JavaScript', 'TypeScript', 'Angular', 'RxJS', 'jQuery'],
  },
  {
    title: 'UI & Design',
    items: ['Tailwind CSS', 'Bootstrap', 'Angular Material', 'PrimeNG', 'Figma', 'Responsive Design', 'SEO-friendly markup'],
  },
  {
    title: 'Platform & Workflow',
    items: ['nopCommerce', 'WordPress', 'Sanity', 'Git / GitHub / Bitbucket', 'JIRA', 'Agile & Scrum', 'PHP & MySQL'],
  },
];

export const SOCIALS: SocialLink[] = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/rhossain' },
  { label: 'Facebook', url: 'https://www.facebook.com/rhossainbd' },
  { label: 'Instagram', url: 'https://www.instagram.com/rshossain.bd' },
  { label: 'WhatsApp', url: 'https://wa.me/8801713204761' },
];

export const DEFAULT_PORTFOLIO: PortfolioContent = {
  profile: PROFILE,
  navLinks: NAV_LINKS,
  marqueeItems: MARQUEE_ITEMS,
  about: ABOUT,
  experience: EXPERIENCE,
  projects: PROJECTS,
  skillGroups: SKILL_GROUPS,
  socials: SOCIALS,
};

/** Explicit slugs stay stable when project titles change; legacy content remains compatible. */
export function projectSlug(project: Project): string {
  return project.slug || project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project-' + project.index;
}
