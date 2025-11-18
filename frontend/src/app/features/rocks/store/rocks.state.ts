import { Rock, Edge } from 'shared/types';

export interface RocksState {
  rocks: Rock[];
  selectedRock: Rock | null;
  edges: Edge[];
  loading: boolean;
  error: string | null;
}

export const initialRocksState: RocksState = {
  rocks: [],
  selectedRock: null,
  edges: [],
  loading: false,
  error: null,
};
