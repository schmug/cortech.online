import { describe, it, expect, beforeEach } from 'vitest';
import { useMobile } from './store';

beforeEach(() => {
  useMobile.setState({ openAppId: null });
});

describe('mobile store', () => {
  it('starts with no app open', () => {
    expect(useMobile.getState().openAppId).toBeNull();
  });

  it('openApp sets openAppId', () => {
    useMobile.getState().openApp('dmarc-mx');
    expect(useMobile.getState().openAppId).toBe('dmarc-mx');
  });

  it('closeApp clears openAppId', () => {
    useMobile.getState().openApp('dmarc-mx');
    useMobile.getState().closeApp();
    expect(useMobile.getState().openAppId).toBeNull();
  });

  it('openApp replaces the previously open app', () => {
    useMobile.getState().openApp('dmarc-mx');
    useMobile.getState().openApp('about');
    expect(useMobile.getState().openAppId).toBe('about');
  });
});
