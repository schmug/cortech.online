import { create } from 'zustand';

type MobileState = {
  openAppId: string | null;
  openApp: (id: string) => void;
  closeApp: () => void;
};

export const useMobile = create<MobileState>((set) => ({
  openAppId: null,
  openApp: (id) => set({ openAppId: id }),
  closeApp: () => set({ openAppId: null }),
}));
