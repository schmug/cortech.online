import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppManifest } from '../../apps/registry';

export type WindowRect = { x: number; y: number; w: number; h: number };

export type WindowState = {
  id: string;
  appId: string;
  title: string;
  icon: string | unknown;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  preMax?: WindowRect;
};

export type OSState = {
  windows: WindowState[];
  focusedId: string | null;
  nextZ: number;
  hasBooted: boolean;
  openApp: (app: AppManifest) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string, viewport: { w: number; h: number }) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number, x?: number, y?: number) => void;
  setBooted: (v: boolean) => void;
  resetLayout: () => void;
};

const INITIAL_OFFSET = 24;
const CASCADE = 28;

function nextCascade(count: number): { x: number; y: number } {
  const step = count % 8;
  return { x: INITIAL_OFFSET + step * CASCADE, y: INITIAL_OFFSET + step * CASCADE };
}

export const useOS = create<OSState>()(
  persist(
    (set, get) => ({
      windows: [],
      focusedId: null,
      nextZ: 1,
      hasBooted: false,

      openApp: (app) => {
        const state = get();
        if (app.allowMultiple === false) {
          const existing = state.windows.find((w) => w.appId === app.id);
          if (existing) {
            state.focusWindow(existing.id);
            if (existing.minimized) state.restoreWindow(existing.id);
            return;
          }
        }
        const instanceId =
          app.allowMultiple === false
            ? app.id
            : `${app.id}#${Date.now().toString(36)}`;
        const { x, y } = nextCascade(state.windows.length);
        const z = state.nextZ;
        set({
          windows: [
            ...state.windows,
            {
              id: instanceId,
              appId: app.id,
              title: app.name,
              icon: app.icon,
              x,
              y,
              w: app.defaultSize.w,
              h: app.defaultSize.h,
              z,
              minimized: false,
              maximized: false,
            },
          ],
          focusedId: instanceId,
          nextZ: z + 1,
        });
      },

      closeWindow: (id) => {
        set((s) => {
          const remaining = s.windows.filter((w) => w.id !== id);
          let nextFocus = s.focusedId === id ? null : s.focusedId;
          if (!nextFocus && remaining.length > 0) {
            nextFocus = remaining.reduce((a, b) => (a.z > b.z ? a : b)).id;
          }
          return { windows: remaining, focusedId: nextFocus };
        });
      },

      focusWindow: (id) => {
        set((s) => {
          const target = s.windows.find((w) => w.id === id);
          if (!target) return {};
          if (s.focusedId === id && target.z === s.nextZ - 1) return {};
          const z = s.nextZ;
          return {
            windows: s.windows.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)),
            focusedId: id,
            nextZ: z + 1,
          };
        });
      },

      minimizeWindow: (id) => {
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
          focusedId: s.focusedId === id ? null : s.focusedId,
        }));
      },

      restoreWindow: (id) => {
        get().focusWindow(id);
      },

      toggleMaximize: (id, viewport) => {
        set((s) => ({
          windows: s.windows.map((w) => {
            if (w.id !== id) return w;
            if (w.maximized && w.preMax) {
              return { ...w, maximized: false, ...w.preMax, preMax: undefined };
            }
            return {
              ...w,
              maximized: true,
              preMax: { x: w.x, y: w.y, w: w.w, h: w.h },
              x: 0,
              y: 0,
              w: viewport.w,
              h: viewport.h,
            };
          }),
        }));
        get().focusWindow(id);
      },

      moveWindow: (id, x, y) => {
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
        }));
      },

      resizeWindow: (id, w, h, x, y) => {
        set((s) => ({
          windows: s.windows.map((win) =>
            win.id === id ? { ...win, w, h, x: x ?? win.x, y: y ?? win.y } : win
          ),
        }));
      },

      setBooted: (v) => set({ hasBooted: v }),

      resetLayout: () => set({ windows: [], focusedId: null, nextZ: 1 }),
    }),
    {
      name: 'cortechos:layout',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        windows: s.windows,
        nextZ: s.nextZ,
        hasBooted: s.hasBooted,
      }),
    }
  )
);
