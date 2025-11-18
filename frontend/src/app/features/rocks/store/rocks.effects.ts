import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, exhaustMap, tap } from 'rxjs/operators';
import { RocksService } from '../services/rocks.service';
import * as RocksActions from './rocks.actions';

@Injectable()
export class RocksEffects {
  private actions$ = inject(Actions);
  private rocksService = inject(RocksService);
  private router = inject(Router);

  loadRocks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RocksActions.loadRocks),
      exhaustMap(() =>
        this.rocksService.getRocks().pipe(
          map((rocks) => RocksActions.loadRocksSuccess({ rocks })),
          catchError((error) =>
            of(
              RocksActions.loadRocksFailure({
                error: error.error?.message || 'Failed to load rocks',
              })
            )
          )
        )
      )
    )
  );

  loadRockDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RocksActions.loadRockDetail),
      exhaustMap(({ id }) =>
        this.rocksService.getRock(id).pipe(
          map((rock) => {
            if (!rock) {
              return RocksActions.loadRockDetailFailure({
                error: 'Rock not found',
              });
            }
            return RocksActions.loadRockDetailSuccess({ rock });
          }),
          catchError((error) =>
            of(
              RocksActions.loadRockDetailFailure({
                error: error.error?.message || 'Failed to load rock',
              })
            )
          )
        )
      )
    )
  );

  createRock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RocksActions.createRock),
      exhaustMap(({ rock }) =>
        this.rocksService.createRock(rock).pipe(
          map((createdRock) => RocksActions.createRockSuccess({ rock: createdRock })),
          catchError((error) =>
            of(
              RocksActions.createRockFailure({
                error: error.error?.message || 'Failed to create rock',
              })
            )
          )
        )
      )
    )
  );

  createRockSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RocksActions.createRockSuccess),
        tap(() => this.router.navigate(['/rocks']))
      ),
    { dispatch: false }
  );

  updateRock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RocksActions.updateRock),
      exhaustMap(({ id, rock }) =>
        this.rocksService.updateRock(id, rock).pipe(
          map((updatedRock) => RocksActions.updateRockSuccess({ rock: updatedRock })),
          catchError((error) =>
            of(
              RocksActions.updateRockFailure({
                error: error.error?.message || 'Failed to update rock',
              })
            )
          )
        )
      )
    )
  );

  deleteRock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RocksActions.deleteRock),
      exhaustMap(({ id }) =>
        this.rocksService.deleteRock(id).pipe(
          map(() => RocksActions.deleteRockSuccess({ id })),
          catchError((error) =>
            of(
              RocksActions.deleteRockFailure({
                error: error.error?.message || 'Failed to delete rock',
              })
            )
          )
        )
      )
    )
  );

  deleteRockSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RocksActions.deleteRockSuccess),
        tap(() => this.router.navigate(['/rocks']))
      ),
    { dispatch: false }
  );

  loadEdges$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RocksActions.loadEdges),
      exhaustMap(({ rockId }) =>
        this.rocksService.getEdges(rockId).pipe(
          map((edges) => RocksActions.loadEdgesSuccess({ edges })),
          catchError((error) =>
            of(
              RocksActions.loadEdgesFailure({
                error: error.error?.message || 'Failed to load edges',
              })
            )
          )
        )
      )
    )
  );

  createEdge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RocksActions.createEdge),
      exhaustMap(({ rockId, edge }) =>
        this.rocksService.createEdge(rockId, edge).pipe(
          map((createdEdge) => RocksActions.createEdgeSuccess({ edge: createdEdge })),
          catchError((error) =>
            of(
              RocksActions.createEdgeFailure({
                error: error.error?.message || 'Failed to create edge',
              })
            )
          )
        )
      )
    )
  );

  updateEdge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RocksActions.updateEdge),
      exhaustMap(({ id, edge }) =>
        this.rocksService.updateEdge(id, edge).pipe(
          map((updatedEdge) => RocksActions.updateEdgeSuccess({ edge: updatedEdge })),
          catchError((error) =>
            of(
              RocksActions.updateEdgeFailure({
                error: error.error?.message || 'Failed to update edge',
              })
            )
          )
        )
      )
    )
  );

  deleteEdge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RocksActions.deleteEdge),
      exhaustMap(({ id }) =>
        this.rocksService.deleteEdge(id).pipe(
          map(() => RocksActions.deleteEdgeSuccess({ id })),
          catchError((error) =>
            of(
              RocksActions.deleteEdgeFailure({
                error: error.error?.message || 'Failed to delete edge',
              })
            )
          )
        )
      )
    )
  );
}
