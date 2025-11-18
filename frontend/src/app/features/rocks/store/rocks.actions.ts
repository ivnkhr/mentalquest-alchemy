import { createAction, props } from '@ngrx/store';
import { Rock, Edge, CreateRockDto, UpdateRockDto, CreateEdgeDto, UpdateEdgeDto } from 'shared/types';

// Load Rocks
export const loadRocks = createAction('[Rocks] Load Rocks');

export const loadRocksSuccess = createAction(
  '[Rocks] Load Rocks Success',
  props<{ rocks: Rock[] }>()
);

export const loadRocksFailure = createAction(
  '[Rocks] Load Rocks Failure',
  props<{ error: string }>()
);

// Load Rock Detail
export const loadRockDetail = createAction(
  '[Rocks] Load Rock Detail',
  props<{ id: string }>()
);

export const loadRockDetailSuccess = createAction(
  '[Rocks] Load Rock Detail Success',
  props<{ rock: Rock }>()
);

export const loadRockDetailFailure = createAction(
  '[Rocks] Load Rock Detail Failure',
  props<{ error: string }>()
);

// Create Rock
export const createRock = createAction(
  '[Rocks] Create Rock',
  props<{ rock: CreateRockDto }>()
);

export const createRockSuccess = createAction(
  '[Rocks] Create Rock Success',
  props<{ rock: Rock }>()
);

export const createRockFailure = createAction(
  '[Rocks] Create Rock Failure',
  props<{ error: string }>()
);

// Update Rock
export const updateRock = createAction(
  '[Rocks] Update Rock',
  props<{ id: string; rock: UpdateRockDto }>()
);

export const updateRockSuccess = createAction(
  '[Rocks] Update Rock Success',
  props<{ rock: Rock }>()
);

export const updateRockFailure = createAction(
  '[Rocks] Update Rock Failure',
  props<{ error: string }>()
);

// Delete Rock
export const deleteRock = createAction(
  '[Rocks] Delete Rock',
  props<{ id: string }>()
);

export const deleteRockSuccess = createAction(
  '[Rocks] Delete Rock Success',
  props<{ id: string }>()
);

export const deleteRockFailure = createAction(
  '[Rocks] Delete Rock Failure',
  props<{ error: string }>()
);

// Load Edges
export const loadEdges = createAction(
  '[Rocks] Load Edges',
  props<{ rockId: string }>()
);

export const loadEdgesSuccess = createAction(
  '[Rocks] Load Edges Success',
  props<{ edges: Edge[] }>()
);

export const loadEdgesFailure = createAction(
  '[Rocks] Load Edges Failure',
  props<{ error: string }>()
);

// Create Edge
export const createEdge = createAction(
  '[Rocks] Create Edge',
  props<{ rockId: string; edge: CreateEdgeDto }>()
);

export const createEdgeSuccess = createAction(
  '[Rocks] Create Edge Success',
  props<{ edge: Edge }>()
);

export const createEdgeFailure = createAction(
  '[Rocks] Create Edge Failure',
  props<{ error: string }>()
);

// Update Edge
export const updateEdge = createAction(
  '[Rocks] Update Edge',
  props<{ id: string; edge: UpdateEdgeDto }>()
);

export const updateEdgeSuccess = createAction(
  '[Rocks] Update Edge Success',
  props<{ edge: Edge }>()
);

export const updateEdgeFailure = createAction(
  '[Rocks] Update Edge Failure',
  props<{ error: string }>()
);

// Delete Edge
export const deleteEdge = createAction(
  '[Rocks] Delete Edge',
  props<{ id: string }>()
);

export const deleteEdgeSuccess = createAction(
  '[Rocks] Delete Edge Success',
  props<{ id: string }>()
);

export const deleteEdgeFailure = createAction(
  '[Rocks] Delete Edge Failure',
  props<{ error: string }>()
);

// Clear Error
export const clearError = createAction('[Rocks] Clear Error');
