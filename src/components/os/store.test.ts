import { describe, it, expect, beforeEach } from 'vitest';
import { useOS } from './store';
import type { AppManifest } from '../../apps/registry';

const noopComponent = () => Promise.resolve({ default: () => null as any });

function makeApp(overrides: Partial<AppManifest> = {}): AppManifest {
  return {
    id: 'test-app',
    name: 'Test App',
    description: 'desc',
    icon: 'i',
    type: 'native',
    component: noopComponent,
    defaultSize: { w: 400, h: 300 },
    allowMultiple: false, // stable ids in tests
    ...overrides,
  };
}

beforeEach(() => {
  useOS.setState({ windows: [], focusedId: null, nextZ: 1, hasBooted: false });
  localStorage.clear();
});

describe('openApp', () => {
  it('first open: places at INITIAL_OFFSET, z=1, focused, nextZ=2', () => {
    useOS.getState().openApp(makeApp());
    const s = useOS.getState();
    expect(s.windows).toHaveLength(1);
    const w = s.windows[0]!;
    expect(w.x).toBe(24);
    expect(w.y).toBe(24);
    expect(w.z).toBe(1);
    expect(w.w).toBe(400);
    expect(w.h).toBe(300);
    expect(s.focusedId).toBe(w.id);
    expect(s.nextZ).toBe(2);
  });

  it('second open cascades by 28 on both axes and increments z', () => {
    useOS.getState().openApp(makeApp({ id: 'a' }));
    useOS.getState().openApp(makeApp({ id: 'b' }));
    const s = useOS.getState();
    expect(s.windows).toHaveLength(2);
    const second = s.windows[1]!;
    expect(second.x).toBe(24 + 28);
    expect(second.y).toBe(24 + 28);
    expect(second.z).toBe(2);
    expect(s.nextZ).toBe(3);
  });

  it('singleton with existing: focuses existing, no new window, stable id', () => {
    const app = makeApp({ allowMultiple: false });
    useOS.getState().openApp(app);
    const firstId = useOS.getState().windows[0]!.id;
    expect(firstId).toBe(app.id); // stable id for singletons
    useOS.getState().openApp(app);
    const s = useOS.getState();
    expect(s.windows).toHaveLength(1);
    expect(s.focusedId).toBe(firstId);
  });

  it('singleton with existing minimized: restores (clears minimized)', () => {
    const app = makeApp({ allowMultiple: false });
    useOS.getState().openApp(app);
    useOS.getState().minimizeWindow(app.id);
    expect(useOS.getState().windows[0]!.minimized).toBe(true);
    useOS.getState().openApp(app);
    const s = useOS.getState();
    expect(s.windows[0]!.minimized).toBe(false);
    expect(s.focusedId).toBe(app.id);
  });

  it('opts.focus === false: window added but focusedId unchanged', () => {
    useOS.getState().openApp(makeApp({ id: 'a' }));
    const focusedBefore = useOS.getState().focusedId;
    useOS.getState().openApp(makeApp({ id: 'b' }), { focus: false });
    const s = useOS.getState();
    expect(s.windows).toHaveLength(2);
    expect(s.focusedId).toBe(focusedBefore);
  });
});

describe('focusWindow', () => {
  it('bumps z, sets focusedId, clears minimized', () => {
    useOS.getState().openApp(makeApp({ id: 'a' }));
    useOS.getState().openApp(makeApp({ id: 'b' }));
    // focus 'a' (currently behind 'b', not focused)
    useOS.getState().minimizeWindow('a');
    expect(useOS.getState().windows.find((w) => w.id === 'a')!.minimized).toBe(true);
    const nextZBefore = useOS.getState().nextZ;
    useOS.getState().focusWindow('a');
    const s = useOS.getState();
    const a = s.windows.find((w) => w.id === 'a')!;
    expect(a.z).toBe(nextZBefore);
    expect(a.minimized).toBe(false);
    expect(s.focusedId).toBe('a');
    expect(s.nextZ).toBe(nextZBefore + 1);
  });

  it('no-op when already topmost and focused', () => {
    useOS.getState().openApp(makeApp({ id: 'a' }));
    const before = useOS.getState();
    useOS.getState().focusWindow('a');
    const after = useOS.getState();
    expect(after.nextZ).toBe(before.nextZ);
    expect(after.windows[0]!.z).toBe(before.windows[0]!.z);
    expect(after.focusedId).toBe(before.focusedId);
  });
});

describe('closeWindow', () => {
  it('focus falls through to next-highest-z when closing focused window', () => {
    useOS.getState().openApp(makeApp({ id: 'a' })); // z=1
    useOS.getState().openApp(makeApp({ id: 'b' })); // z=2
    useOS.getState().openApp(makeApp({ id: 'c' })); // z=3, focused
    useOS.getState().closeWindow('c');
    const s = useOS.getState();
    expect(s.windows).toHaveLength(2);
    // remaining: a(z=1), b(z=2) → b is highest
    expect(s.focusedId).toBe('b');
  });

  it('preserves focusedId when closing a non-focused window', () => {
    useOS.getState().openApp(makeApp({ id: 'a' }));
    useOS.getState().openApp(makeApp({ id: 'b' })); // focused
    useOS.getState().closeWindow('a');
    expect(useOS.getState().focusedId).toBe('b');
  });
});

describe('minimizeWindow', () => {
  it('sets minimized, clears focusedId if focused, keeps in list', () => {
    useOS.getState().openApp(makeApp({ id: 'a' }));
    useOS.getState().minimizeWindow('a');
    const s = useOS.getState();
    expect(s.windows).toHaveLength(1);
    expect(s.windows[0]!.minimized).toBe(true);
    expect(s.focusedId).toBeNull();
  });
});

describe('toggleMaximize', () => {
  it('round-trip: maximize captures preMax, restore returns to original rect', () => {
    useOS.getState().openApp(makeApp({ id: 'a' }));
    const original = useOS.getState().windows[0]!;
    const origRect = { x: original.x, y: original.y, w: original.w, h: original.h };

    useOS.getState().toggleMaximize('a', { w: 1024, h: 768 });
    const maxed = useOS.getState().windows[0]!;
    expect(maxed.maximized).toBe(true);
    expect(maxed.preMax).toEqual(origRect);
    expect(maxed.x).toBe(0);
    expect(maxed.y).toBe(0);
    expect(maxed.w).toBe(1024);
    expect(maxed.h).toBe(768);

    useOS.getState().toggleMaximize('a', { w: 1024, h: 768 });
    const restored = useOS.getState().windows[0]!;
    expect(restored.maximized).toBe(false);
    expect(restored.preMax).toBeUndefined();
    expect({ x: restored.x, y: restored.y, w: restored.w, h: restored.h }).toEqual(origRect);
  });
});

describe('moveWindow / resizeWindow', () => {
  it('mutate rect only — no z/focus/nextZ side effects', () => {
    useOS.getState().openApp(makeApp({ id: 'a' }));
    useOS.getState().openApp(makeApp({ id: 'b' })); // focused
    const before = useOS.getState();

    useOS.getState().moveWindow('a', 100, 200);
    useOS.getState().resizeWindow('a', 500, 600);

    const after = useOS.getState();
    const a = after.windows.find((w) => w.id === 'a')!;
    expect(a.x).toBe(100);
    expect(a.y).toBe(200);
    expect(a.w).toBe(500);
    expect(a.h).toBe(600);
    expect(after.focusedId).toBe(before.focusedId);
    expect(after.nextZ).toBe(before.nextZ);
    expect(after.windows.find((w) => w.id === 'a')!.z).toBe(
      before.windows.find((w) => w.id === 'a')!.z
    );
  });
});

describe('persistence partialize', () => {
  it('persists windows/nextZ/hasBooted but not focusedId', () => {
    const opts = useOS.persist.getOptions();
    expect(opts.partialize).toBeDefined();
    const slice = opts.partialize!(useOS.getState()) as Record<string, unknown>;
    expect(Object.keys(slice).sort()).toEqual(['hasBooted', 'nextZ', 'windows']);
    expect(slice).not.toHaveProperty('focusedId');
  });

  it('openApp writes a partialized slice (no focusedId) to localStorage', () => {
    useOS.getState().openApp(makeApp({ id: 'a' }));
    useOS.setState({ hasBooted: true });

    const raw = localStorage.getItem('cortechos:layout');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.state).not.toHaveProperty('focusedId');
    expect(parsed.state.windows).toHaveLength(1);
    expect(parsed.state.hasBooted).toBe(true);
  });

  it('rehydrate loads a preset localStorage blob and leaves focusedId null', async () => {
    // Preset a saved layout directly; bypass openApp so the in-memory write
    // doesn't re-trigger persistence.
    const blob = {
      state: {
        windows: [
          {
            id: 'preset',
            appId: 'preset',
            title: 'Preset',
            icon: 'i',
            x: 100,
            y: 200,
            w: 400,
            h: 300,
            z: 5,
            minimized: false,
            maximized: false,
          },
        ],
        nextZ: 6,
        hasBooted: true,
      },
      version: 1,
    };
    localStorage.setItem('cortechos:layout', JSON.stringify(blob));

    await useOS.persist.rehydrate();

    const after = useOS.getState();
    expect(after.windows).toHaveLength(1);
    expect(after.windows[0]!.id).toBe('preset');
    expect(after.windows[0]!.x).toBe(100);
    expect(after.nextZ).toBe(6);
    expect(after.hasBooted).toBe(true);
    expect(after.focusedId).toBeNull();
  });
});

describe('cascade placement', () => {
  it('9th window wraps back to INITIAL_OFFSET (count % 8)', () => {
    // Use distinct singleton ids so instanceId == id and stays stable.
    for (let i = 0; i < 9; i++) {
      useOS.getState().openApp(makeApp({ id: `app-${i}` }));
    }
    const s = useOS.getState();
    expect(s.windows).toHaveLength(9);
    const ninth = s.windows[8]!;
    expect(ninth.x).toBe(24);
    expect(ninth.y).toBe(24);
  });

  it('cascade offset math: nth window (n<8) is at 24 + n*28', () => {
    for (let i = 0; i < 4; i++) {
      useOS.getState().openApp(makeApp({ id: `app-${i}` }));
    }
    const s = useOS.getState();
    for (let i = 0; i < 4; i++) {
      expect(s.windows[i]!.x).toBe(24 + i * 28);
      expect(s.windows[i]!.y).toBe(24 + i * 28);
    }
  });
});

describe('resetLayout', () => {
  it('clears windows and focusedId, resets nextZ to 1, preserves hasBooted', () => {
    useOS.getState().openApp(makeApp({ id: 'a' }));
    useOS.getState().openApp(makeApp({ id: 'b' }));
    useOS.setState({ hasBooted: true });
    expect(useOS.getState().nextZ).toBeGreaterThan(1);

    useOS.getState().resetLayout();

    const s = useOS.getState();
    expect(s.windows).toEqual([]);
    expect(s.focusedId).toBeNull();
    expect(s.nextZ).toBe(1);
    expect(s.hasBooted).toBe(true);
  });
});
