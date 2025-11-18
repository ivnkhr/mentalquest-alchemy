import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { fromEvent, merge, of, timer } from 'rxjs';
import {
  map,
  switchMap,
  catchError,
  filter,
  tap,
  debounceTime,
  startWith,
} from 'rxjs/operators';
import { SyncService } from './sync.service';
import { createAction, props } from '@ngrx/store';
import { loginSuccess } from '../auth/store/auth.actions';

export const syncTrigger = createAction('[Sync] Trigger Sync');
export const syncSuccess = createAction('[Sync] Sync Success');
export const syncFailure = createAction('[Sync] Sync Failure', props<{ error: string }>());

@Injectable()
export class SyncEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private syncService = inject(SyncService);

  /**
   * Sync on login success
   */
  syncOnLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginSuccess),
      debounceTime(1000),
      map(() => syncTrigger())
    )
  );

  /**
   * Listen for online/offline events
   */
  onlineEvents$ = createEffect(() => {
    if (typeof window === 'undefined') {
      return of();
    }

    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));

    return merge(online$, offline$).pipe(
      startWith(navigator.onLine),
      filter((isOnline) => isOnline),
      debounceTime(1000),
      map(() => syncTrigger())
    );
  });

  /**
   * Periodic sync every 5 minutes when online
   */
  periodicSync$ = createEffect(() => {
    if (typeof window === 'undefined' || !navigator.onLine) {
      return of();
    }

    return timer(0, 5 * 60 * 1000).pipe(
      filter(() => navigator.onLine),
      map(() => syncTrigger())
    );
  });

  /**
   * Execute sync when triggered
   */
  executeSync$ = createEffect(() =>
    this.actions$.pipe(
      ofType(syncTrigger),
      switchMap(() =>
        this.syncService.syncNow().then(
          () => syncSuccess(),
          (error) => syncFailure({ error: error.message || 'Sync failed' })
        )
      )
    )
  );

  /**
   * Log sync results
   */
  logSyncResults$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(syncSuccess, syncFailure),
        tap((action: any) => {
          if (action.type === '[Sync] Sync Success') {
            console.log('Sync completed successfully');
          } else {
            console.error('Sync failed:', action.error);
          }
        })
      ),
    { dispatch: false }
  );
}
