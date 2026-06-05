import { StateCreator } from "zustand";

export interface SettingsSlice {
  chaosMode: boolean;
  audioEnabled: boolean;
  ambientEnabled: boolean;

  toggleChaosMode: () => void;
  toggleAudio: () => void;
  toggleAmbient: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  setChaosMode: (enabled: boolean) => void;
  setAmbientEnabled: (enabled: boolean) => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice & any, [], [], SettingsSlice> = (set) => ({
  chaosMode: false,
  audioEnabled: true,
  ambientEnabled: true,

  toggleChaosMode: () => set((state: any) => ({ chaosMode: !state.chaosMode })),
  toggleAudio: () => set((state: any) => ({ audioEnabled: !state.audioEnabled })),
  toggleAmbient: () => set((state: any) => ({ ambientEnabled: !state.ambientEnabled })),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
  setChaosMode: (enabled) => set({ chaosMode: enabled }),
  setAmbientEnabled: (enabled) => set({ ambientEnabled: enabled }),
});
