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
    loadComponent: () =>
      import('./features/rocks/pages/rock-list/rock-list.component').then(
        (m) => m.RockListComponent
      ),
  },
];
