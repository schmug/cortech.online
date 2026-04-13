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

export async function fetchOriginalRepos(username: string): Promise<Repo[]> {
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
    const data = (await res.json()) as Repo[];
    return data.filter((r) => !r.fork && !r.archived);
  } catch (err) {
    console.warn(`GitHub API fetch failed for ${username}; returning empty repo list.`, err);
    return [];
  }
}
