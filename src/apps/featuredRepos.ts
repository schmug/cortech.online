export type FeaturedRepoManual = {
  description: string;
  language?: string;
  htmlUrl: string;
  homepage?: string;
};

export type FeaturedRepoConfig = {
  fullName: string;
  icon?: string;
  manual?: FeaturedRepoManual;
};

export const featuredRepos: FeaturedRepoConfig[] = [
  { fullName: 'schmug/scubascore', icon: '🤿' },
  { fullName: 'schmug/FeedBat', icon: '🦇' },
  { fullName: 'schmug/opml-backup', icon: '🗂️' },
  { fullName: 'schmug/cupid', icon: '💘' },
  { fullName: 'schmug/untitledgoogetool', icon: '🦢' },
  {
    fullName: 'schmug/school-calendar',
    icon: '📅',
    manual: {
      description: 'Private tool for tracking school calendars.',
      language: 'TypeScript',
      htmlUrl: 'https://github.com/schmug/school-calendar',
    },
  },
];

export type FeaturedRepo = {
  fullName: string;
  name: string;
  icon?: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stargazersCount: number;
  updatedAt: string | null;
  fork: boolean;
  archived: boolean;
  private: boolean;
};

export function repoNameFromFullName(fullName: string): string {
  const slash = fullName.lastIndexOf('/');
  return slash === -1 ? fullName : fullName.slice(slash + 1);
}

export function appIdForFeaturedRepo(fullName: string): string {
  return `gh:${fullName}`;
}
