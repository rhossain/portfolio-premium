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
  role: string;
  overview: string;
  highlights: string[];
}

export interface Project {
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
    title: 'ngCommerce',
    category: 'E-commerce',
    year: '2024',
    description:
      'A modular Angular storefront: RxJS and BehaviorSubject state management, JWT session handling, TTL-based caching to kill redundant requests, and intersection-observer lazy loading for large catalogues.',
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
        'A modular Angular storefront built to prove that enterprise e-commerce can feel fast. Every decision — from state management to asset loading — was measured against real catalogue sizes and slow networks.',
      highlights: [
        'RxJS + BehaviorSubject state layer with TTL-based caching to kill redundant API calls',
        'JWT session handling with route guards and silent token refresh',
        'IntersectionObserver lazy loading keeps large catalogues at a steady 60fps',
        'SEO-friendly, semantic templates translated pixel-perfect from Figma',
      ],
    },
  },
  {
    index: '02',
    title: 'Nop Kalles',
    category: 'E-commerce',
    year: '2023',
    description:
      'A fully responsive nopCommerce theme — custom templates, product galleries and checkout flows tuned for conversion across devices.',
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
        'A fully responsive nopCommerce theme for a fashion retailer — custom Razor templates, product galleries and a checkout flow tuned for conversion across devices.',
      highlights: [
        'Custom Razor templates overriding nopCommerce views without touching core code',
        'Product gallery with zoom, thumbnails and variant-aware image switching',
        'Checkout flow simplified to reduce drop-off on mobile',
        'SCSS architecture with reusable mixins for rapid seasonal reskinning',
      ],
    },
  },
  {
    index: '03',
    title: 'Fortune',
    category: 'E-commerce',
    year: '2022',
    description:
      'Elegant ecommerce UI with carefully crafted product detail pages, category filtering and a mobile-first responsive grid.',
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
        'An elegant e-commerce UI for a jewellery brand — where restraint matters. Carefully crafted product detail pages and a mobile-first grid let the pieces carry the drama.',
      highlights: [
        'Tailwind CSS design tokens for consistent spacing, type and gold-accent palette',
        'Product detail pages with material selectors and care-accordions',
        'Category filtering that stays instant on large collections',
        'Mobile-first grid that reflows gracefully from 320px upward',
      ],
    },
  },
  {
    index: '04',
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
    index: '05',
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
    index: '06',
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
  { label: 'Skype', url: 'https://join.skype.com/invite/vwNHYMYW5jvJ' },
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
