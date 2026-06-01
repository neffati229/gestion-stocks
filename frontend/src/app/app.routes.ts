import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'produits',
        loadComponent: () =>
          import('./features/produits/produits.component').then(m => m.ProduitsComponent)
      },
      {
        path: 'stocks',
        loadComponent: () =>
          import('./features/stocks/stocks.component').then(m => m.StocksComponent)
      },
      {
        path: 'mouvements',
        loadComponent: () =>
          import('./features/stocks/mouvements/mouvements.component').then(m => m.MouvementsComponent)
      },
      {
        path: 'rapports',
        loadComponent: () =>
          import('./features/rapports/rapports.component').then(m => m.RapportsComponent)
      },
      {
        path: 'utilisateurs',
        loadComponent: () =>
          import('./features/utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
