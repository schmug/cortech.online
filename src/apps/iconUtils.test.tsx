import { describe, it, expect } from 'vitest';
import { isValidElement } from 'react';
import { renderIcon } from './iconUtils';

describe('renderIcon', () => {
  it('returns an emoji string unchanged', () => {
    expect(renderIcon('🛡️')).toBe('🛡️');
    expect(renderIcon('📁')).toBe('📁');
  });

  it('returns an <img> React element when the string starts with "/"', () => {
    const node = renderIcon('/mark-sm.svg', 'h-6 w-6');
    expect(isValidElement(node)).toBe(true);
    // ReactElement shape inspection
    const el = node as { type: string; props: { src: string; className?: string; alt?: string } };
    expect(el.type).toBe('img');
    expect(el.props.src).toBe('/mark-sm.svg');
    expect(el.props.className).toBe('h-6 w-6');
    expect(el.props.alt).toBe('');
  });

  it('passes non-string values through unchanged', () => {
    const jsxNode = { type: 'svg', props: {} } as unknown;
    expect(renderIcon(jsxNode)).toBe(jsxNode);
    expect(renderIcon(null)).toBeNull();
    expect(renderIcon(undefined)).toBeUndefined();
  });

  it('non-path strings (e.g. "http://...") are returned as-is, not wrapped in <img>', () => {
    // Only paths starting with "/" are promoted to <img>. URLs are treated as text.
    expect(renderIcon('https://example.com/x.svg')).toBe('https://example.com/x.svg');
  });
});
