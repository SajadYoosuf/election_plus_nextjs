import { create } from 'zustand';

export interface MapHighlights {
  acNumbers: number[];
  color: string;
  label: string;
}

interface MapState {
  selectedAcNo: number | null;
  highlights: MapHighlights | null;
  setSelectedAc: (acNo: number | null) => void;
  setHighlights: (highlights: MapHighlights) => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedAcNo: null,
  highlights: null,
  setSelectedAc: (acNo) => set({ selectedAcNo: acNo }),
  setHighlights: (highlights) => set({ highlights }),
}));
