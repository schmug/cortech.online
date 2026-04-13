import type { ComponentType, ReactNode } from 'react';

export type AppManifest = {
  id: string;
  name: string;
  description: string;
  icon: string | ReactNode;
  type: 'iframe' | 'native';
  url?: string;
  component?: () => Promise<{ default: ComponentType }>;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  allowMultiple?: boolean;
  githubRepo?: string;
  paid?: boolean;
};

export const apps: AppManifest[] = [
  {
    id: 'dmarc-mx',
    name: 'dmarc.mx',
    description: 'Email security analyzer — DMARC, SPF, DKIM, BIMI, MTA-STS.',
    icon: '🛡️',
    type: 'iframe',
    url: 'https://dmarc.mx',
    defaultSize: { w: 960, h: 680 },
    minSize: { w: 480, h: 360 },
    githubRepo: 'schmug/dmarcheck',
    paid: true,
  },
  {
    id: 'donthype-me',
    name: 'donthype.me',
    description: 'TBD — add tagline during M6.',
    icon: '📣',
    type: 'iframe',
    url: 'https://donthype.me',
    defaultSize: { w: 960, h: 680 },
    paid: true,
  },
  {
    id: 'apartment-stager',
    name: 'apartment-stager',
    description: 'TBD — add tagline and URL during M6.',
    icon: '🏠',
    type: 'iframe',
    url: 'https://apartment-stager.example.com',
    defaultSize: { w: 960, h: 680 },
    paid: true,
  },
  {
    id: 'qr-me',
    name: 'q-r.contact',
    description: 'Local QR code generator for contact cards — no tracking, works offline.',
    icon: '📇',
    type: 'iframe',
    url: 'https://q-r.contact',
    defaultSize: { w: 720, h: 720 },
    githubRepo: 'schmug/qr-me',
  },
  {
    id: 'about',
    name: 'About Cory',
    description: 'Bio, what I build, how to reach me.',
    icon: '👋',
    type: 'native',
    defaultSize: { w: 560, h: 480 },
    allowMultiple: false,
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Sponsor, tip, or star my work.',
    icon: '💛',
    type: 'native',
    defaultSize: { w: 560, h: 560 },
    allowMultiple: false,
  },
  {
    id: 'projects',
    name: 'Projects',
    description: 'Everything I have shipped on GitHub.',
    icon: '📁',
    type: 'native',
    defaultSize: { w: 760, h: 560 },
    allowMultiple: false,
  },
];
