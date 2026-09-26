import { fetchEpisodeManifest, type Episode } from './episodes';

// Show Your Work is the fourth clodcast show — weekly, explaining the frontier
// labs' alignment research. It writes the same entry shape as the other shows
// to its own manifest in the same R2 bucket, so only the URL differs; the
// schema, timeout, and warn-and-degrade behavior come from episodes.ts.

/**
 * The show's manifest is at a fixed, public R2 path, so it is the default
 * rather than a required env var — the production build needs no Cloudflare
 * dashboard change to pick the show up when its first episode ships.
 */
export const SHOW_YOUR_WORK_MANIFEST_URL =
  'https://clodcast.cortech.online/manifest-show-your-work.json';

/**
 * `SHOW_YOUR_WORK_MANIFEST_URL` overrides the default (the e2e suite points it
 * at a fixture); setting it to an empty value opts a build out of the fetch
 * entirely, which is the only way to get a guaranteed-offline build.
 */
function manifestUrl(): string | null {
  const override = process.env.SHOW_YOUR_WORK_MANIFEST_URL;
  if (override === undefined) return SHOW_YOUR_WORK_MANIFEST_URL;
  return override.trim() ? override.trim() : null;
}

export async function fetchShowYourWorkEpisodes(): Promise<Episode[]> {
  return fetchEpisodeManifest(manifestUrl(), 'show-your-work');
}
