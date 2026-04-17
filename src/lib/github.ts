import {
  featuredRepos,
  repoNameFromFullName,
  type FeaturedRepo,
  type FeaturedRepoConfig,
} from '../apps/featuredRepos';

export type Repo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  fork: boolean;
  archived: boolean;
  topics?: string[];
};

export async function fetchAllRepos(username: string): Promise<Repo[]> {
  const url = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'cortech.online-portfolio',
        Accept: 'application/vnd.github+json',
      },
    });
    if (!res.ok) {
      console.warn(`GitHub API returned ${res.status} for ${username}; returning empty repo list.`);
      return [];
    }
    return (await res.json()) as Repo[];
  } catch (err) {
    console.warn(`GitHub API fetch failed for ${username}; returning empty repo list.`, err);
    return [];
  }
}

export async function fetchOriginalRepos(username: string): Promise<Repo[]> {
  const all = await fetchAllRepos(username);
  return all.filter((r) => !r.fork && !r.archived);
}

export function buildFeaturedRepos(
  repos: Repo[],
  configs: FeaturedRepoConfig[] = featuredRepos
): FeaturedRepo[] {
  const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));
  const out: FeaturedRepo[] = [];

  for (const cfg of configs) {
    const shortName = repoNameFromFullName(cfg.fullName);
    const repo = byName.get(shortName.toLowerCase());

    if (repo) {
      out.push({
        fullName: cfg.fullName,
        name: repo.name,
        icon: cfg.icon,
        description: repo.description,
        htmlUrl: repo.html_url,
        homepage: repo.homepage && repo.homepage.trim() ? repo.homepage : null,
        language: repo.language,
        stargazersCount: repo.stargazers_count,
        updatedAt: repo.updated_at,
        fork: repo.fork,
        archived: repo.archived,
        private: false,
      });
      continue;
    }

    if (cfg.manual) {
      out.push({
        fullName: cfg.fullName,
        name: shortName,
        icon: cfg.icon,
        description: cfg.manual.description,
        htmlUrl: cfg.manual.htmlUrl,
        homepage: cfg.manual.homepage ?? null,
        language: cfg.manual.language ?? null,
        stargazersCount: 0,
        updatedAt: null,
        fork: false,
        archived: false,
        private: true,
      });
    }
  }

  return out;
}
