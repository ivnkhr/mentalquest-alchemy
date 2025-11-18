import { createReducer, on } from '@ngrx/store';
import { RocksState, initialRocksState } from './rocks.state';
import * as RocksActions from './rocks.actions';

export const rocksReducer = createReducer(
  initialRocksState,

  // Load Rocks
  on(RocksActions.loadRocks, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(RocksActions.loadRocksSuccess, (state, { rocks }) => ({
    ...state,
    rocks,
    loading: false,
    error: null,
  })),

  on(RocksActions.loadRocksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load Rock Detail
  on(RocksActions.loadRockDetail, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(RocksActions.loadRockDetailSuccess, (state, { rock }) => ({
    ...state,
    selectedRock: rock,
    loading: false,
    error: null,
  })),

  on(RocksActions.loadRockDetailFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create Rock
  on(RocksActions.createRock, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(RocksActions.createRockSuccess, (state, { rock }) => ({
    ...state,
    rocks: [...state.rocks, rock],
    loading: false,
    error: null,
  })),

  on(RocksActions.createRockFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update Rock
  on(RocksActions.updateRock, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(RocksActions.updateRockSuccess, (state, { rock }) => ({
    ...state,
    rocks: state.rocks.map((r) => (r.id === rock.id ? rock : r)),
    selectedRock: state.selectedRock?.id === rock.id ? rock : state.selectedRock,
    loading: false,
    error: null,
  })),

  on(RocksActions.updateRockFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete Rock
  on(RocksActions.deleteRock, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(RocksActions.deleteRockSuccess, (state, { id }) => ({
    ...state,
    rocks: state.rocks.filter((r) => r.id !== id),
    selectedRock: state.selectedRock?.id === id ? null : state.selectedRock,
    loading: false,
    error: null,
  })),

  on(RocksActions.deleteRockFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load Edges
  on(RocksActions.loadEdges, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(RocksActions.loadEdgesSuccess, (state, { edges }) => ({
    ...state,
    edges,
    loading: false,
    error: null,
  })),

  on(RocksActions.loadEdgesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create Edge
  on(RocksActions.createEdge, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(RocksActions.createEdgeSuccess, (state, { edge }) => ({
    ...state,
    edges: [...state.edges, edge],
    loading: false,
    error: null,
  })),

  on(RocksActions.createEdgeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update Edge
  on(RocksActions.updateEdge, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(RocksActions.updateEdgeSuccess, (state, { edge }) => ({
    ...state,
    edges: state.edges.map((e) => (e.id === edge.id ? edge : e)),
    loading: false,
    error: null,
  })),

  on(RocksActions.updateEdgeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete Edge
  on(RocksActions.deleteEdge, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(RocksActions.deleteEdgeSuccess, (state, { id }) => ({
    ...state,
    edges: state.edges.filter((e) => e.id !== id),
    loading: false,
    error: null,
  })),

  on(RocksActions.deleteEdgeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Clear Error
  on(RocksActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
