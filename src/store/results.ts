import { create } from 'zustand';
import { ECIStateData, Insight } from '@/lib/types';

interface ResultsState {
  liveResultsJson: string;
  insights: Insight[];
  setLiveResults: (data: ECIStateData) => void;
}

export const useResultsStore = create<ResultsState>((set) => ({
  liveResultsJson: '{}',
  insights: [],
  setLiveResults: (data) => set({ liveResultsJson: JSON.stringify(data) }),
}));
