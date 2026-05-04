export interface Candidate {
  name: string;
  party: string;
  votes: number;
  margin: number;
  status: string;
}

export interface ConstituencyDetail {
  candidates: Candidate[];
}

export interface ChartEntry {
  0: string; // party
  1: string; // stateCode
  2: string; // acNo
  3: string; // candidate
  4: string; // color
}

export interface ECIStateData {
  S11?: {
    chartData?: (string | number)[][];
  };
}

export interface Insight {
  title: string;
  color: string;
  icon: string;
}
