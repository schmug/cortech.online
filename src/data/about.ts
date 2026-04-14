export const tagline = 'Indie builder · Cloudflare-native · studio-of-one';

export const bio: readonly string[] = [
  "I'm Cory. I build small, well-scoped software and ship it under cortech.online. Most of what I make is one person's worth of work: a DNS tool, an email-auth utility, a QR-code service, a stager for apartment photos. Some of it pays; most of it doesn't. That's fine — the point is that it exists.",
  '"Studio of one" is the honest label. No co-founder, no roadmap meetings, no quarterly planning. I pick a problem I actually have, build the smallest thing that solves it, and put it online. If it\'s useful to someone else, even better.',
  'The stack is Cloudflare — Pages, Workers, D1, KV, R2. Not because it\'s trendy, but because one person can run a real product on it without paging themselves at 3 AM. Edge-by-default removes a whole class of infra decisions I\'d rather not be making.',
  'CortechOS, the desktop metaphor you\'re looking at, is a joke that kept going. A portfolio site should reflect the shape of the work. Mine is a pile of small windows that each do one thing. So: here\'s a pile of small windows.',
];

export type FocusItem = {
  badge: string;
  title: string;
  note: string;
};

export const currentFocus: readonly FocusItem[] = [
  { badge: '🛡️', title: 'dmarc.mx', note: 'DMARC, SPF, DKIM, BIMI, MTA-STS in one scan.' },
  { badge: '📣', title: 'donthype.me', note: 'RSS feed discovery and reading without the hype cycle.' },
  { badge: '📇', title: 'q-r.contact', note: 'Contact QR codes generated locally; no tracking.' },
  { badge: '🧠', title: 'Claude Code tooling', note: 'cclog, claude-view, claudzibit, karkinos — sharper agents.' },
];

export type SocialLink = {
  label: string;
  href: string;
  value: string;
};

export const socialLinks: readonly SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/schmug', value: 'github.com/schmug' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/cory-rankin/', value: 'linkedin.com/in/cory-rankin' },
  { label: 'Sponsor', href: 'https://github.com/sponsors/schmug', value: 'github.com/sponsors/schmug' },
];
