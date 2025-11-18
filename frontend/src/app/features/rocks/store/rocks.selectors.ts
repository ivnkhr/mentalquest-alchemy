import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RocksState } from './rocks.state';
import { RockStatus } from 'shared/types';

export const selectRocksState = createFeatureSelector<RocksState>('rocks');

export const selectAllRocks = createSelector(
  selectRocksState,
  (state: RocksState) => state.rocks
);

export const selectActiveRocks = createSelector(
  selectAllRocks,
  (rocks) => rocks.filter((rock) => rock.status === RockStatus.ACTIVE)
);

export const selectGems = createSelector(
  selectAllRocks,
  (rocks) => rocks.filter((rock) => rock.status === RockStatus.GEM)
);

export const selectArchivedRocks = createSelector(
  selectAllRocks,
  (rocks) => rocks.filter((rock) => rock.status === RockStatus.ARCHIVED)
);

export const selectSelectedRock = createSelector(
  selectRocksState,
  (state: RocksState) => state.selectedRock
);

export const selectEdges = createSelector(
  selectRocksState,
  (state: RocksState) => state.edges
);

export const selectLoading = createSelector(
  selectRocksState,
  (state: RocksState) => state.loading
);

export const selectError = createSelector(
  selectRocksState,
  (state: RocksState) => state.error
);
