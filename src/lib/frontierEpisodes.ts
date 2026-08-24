import { fetchEpisodeManifest, type Episode } from './episodes';

// Frontier Commits is the second clodcast show — weekly, on what the frontier
// AI labs push to GitHub in public. It writes the same entry shape as the daily
// show to its own manifest in the same R2 bucket, so only the URL differs;
// the schema, timeout, and warn-and-degrade behavior come from episodes.ts.

/**
 * The show's manifest is at a fixed, public R2 path, so it is the default
 * rather than a required env var — the production build needs no Cloudflare
 * dashboard change to pick the show up when its first episode ships.
 */
export const FRONTIER_MANIFEST_URL =
  'https://clodcast.cortech.online/manifest-frontier-commits.json';

/**
 * `FRONTIER_MANIFEST_URL` overrides the default (the e2e suite points it at a
 * fixture); setting it to an empty value opts a build out of the fetch
 * entirely, which is the only way to get a guaranteed-offline build.
 */
function manifestUrl(): string | null {
  const override = process.env.FRONTIER_MANIFEST_URL;
  if (override === undefined) return FRONTIER_MANIFEST_URL;
  return override.trim() ? override.trim() : null;
}

export async function fetchFrontierEpisodes(): Promise<Episode[]> {
  return fetchEpisodeManifest(manifestUrl(), 'frontier-commits');
}
