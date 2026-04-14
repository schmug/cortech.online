import { describe, expect, it } from 'vitest';
import { bio, currentFocus, socialLinks, tagline } from './about';

describe('about data', () => {
  it('has a non-empty tagline', () => {
    expect(tagline.trim().length).toBeGreaterThan(0);
  });

  it('has at least four non-empty bio paragraphs', () => {
    expect(bio.length).toBeGreaterThanOrEqual(4);
    for (const paragraph of bio) {
      expect(paragraph.trim().length).toBeGreaterThan(0);
    }
  });

  it('has at least one current-focus item with a badge, title, and note', () => {
    expect(currentFocus.length).toBeGreaterThan(0);
    for (const item of currentFocus) {
      expect(item.badge.trim().length).toBeGreaterThan(0);
      expect(item.title.trim().length).toBeGreaterThan(0);
      expect(item.note.trim().length).toBeGreaterThan(0);
    }
  });

  it('social links all use https and expose a visible value', () => {
    expect(socialLinks.length).toBeGreaterThan(0);
    for (const link of socialLinks) {
      expect(link.href).toMatch(/^https:\/\//);
      expect(link.label.trim().length).toBeGreaterThan(0);
      expect(link.value.trim().length).toBeGreaterThan(0);
    }
  });
});
