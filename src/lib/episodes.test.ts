import { describe, expect, it } from 'vitest';
import { summaryText } from './episodes';

// The real manifest `description` clodcast emits for an episode: a lead
// <p>summary</p> followed by one <p>(mm:ss) - Title - <a>source</a></p> per
// chapter. Captured from production (the June 1 2026 episode) so these tests
// pin behavior against the exact bytes, not an inferred shape.
const PRODUCTION_DESCRIPTION =
  '<p>Claude agents get a secure home on Cloudflare, Anthropic hands EU regulators ' +
  'an AI that writes its own exploits, an AI cracks an 80-year-old math problem, plus ' +
  'fresh vulnerabilities, new silicon, and China’s first brain implant.</p>' +
  '<p>(0:00) - Intro</p>' +
  '<p>(0:21) - Cloudflare runs Claude&#x27;s agents - ' +
  '<a href="https://blog.cloudflare.com/claude-managed-agents/">source</a></p>' +
  '<p>(8:54) - Sign-off</p>';

const PRODUCTION_SUMMARY =
  'Claude agents get a secure home on Cloudflare, Anthropic hands EU regulators an AI ' +
  'that writes its own exploits, an AI cracks an 80-year-old math problem, plus fresh ' +
  'vulnerabilities, new silicon, and China’s first brain implant.';

describe('summaryText', () => {
  it('returns the lead summary paragraph from the production description', () => {
    expect(summaryText(PRODUCTION_DESCRIPTION)).toBe(PRODUCTION_SUMMARY);
  });

  it('drops the timestamped chapter list, its source links, and all tags', () => {
    const result = summaryText(PRODUCTION_DESCRIPTION);
    expect(result).not.toContain('<p>');
    expect(result).not.toContain('</p>');
    expect(result).not.toContain('<a href');
    expect(result).not.toContain('(0:00)');
    expect(result).not.toContain('(8:54)');
    expect(result).not.toContain('source');
  });

  it('decodes HTML entities so no raw &#x27;-style entities survive', () => {
    expect(summaryText('<p>Rust &amp; Go &#x27;26, said &quot;Schmug&quot; &lt;b&gt;</p>')).toBe(
      'Rust & Go \'26, said "Schmug" <b>',
    );
    expect(summaryText('<p>it&apos;s &#39;quoted&#39;</p>')).toBe("it's 'quoted'");
  });

  it('joins multiple lead paragraphs but stops at the first chapter line', () => {
    expect(summaryText('<p>First half.</p><p>Second half.</p><p>(0:00) - Intro</p>')).toBe(
      'First half. Second half.',
    );
  });

  it('returns plain-text descriptions unchanged', () => {
    expect(summaryText('Just a plain summary, no markup.')).toBe(
      'Just a plain summary, no markup.',
    );
  });

  it('returns an empty string when there is no lead prose before the chapters', () => {
    expect(summaryText('<p>(0:00) - Intro</p><p>(1:00) - Topic</p>')).toBe('');
    expect(summaryText('')).toBe('');
  });

  it('handles H:MM:SS timestamps and collapses whitespace', () => {
    expect(summaryText('<p>Long\n  show   summary.</p><p>(1:02:03) - Late chapter</p>')).toBe(
      'Long show summary.',
    );
  });
});
