import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'rocks',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/rocks/pages/rock-list/rock-list.component').then(
            (m) => m.RockListComponent
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/rocks/pages/rock-form/rock-form.component').then(
            (m) => m.RockFormComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/rocks/pages/rock-detail/rock-detail.component').then(
            (m) => m.RockDetailComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./features/rocks/pages/rock-form/rock-form.component').then(
            (m) => m.RockFormComponent
          ),
      },
    ],
  },
];
