import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  language: 'ml' | 'en';
  setLanguage: (lang: 'ml' | 'en') => void;
  toggleLanguage: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      language: 'ml',
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'ml' ? 'en' : 'ml' })),
    }),
    { name: 'kep-preferences' }
  )
);
