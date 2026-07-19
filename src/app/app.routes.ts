import { Routes } from '@angular/router';

import { AppLayoutComponent } from '@core/layout/app-layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent),
      },
      {
        path: 'assets',
        loadComponent: () =>
          import('./features/assets/assets.component')
            .then(m => m.AssetsComponent),
      },
      {
        path: 'assessments',
        loadComponent: () =>
          import('./features/assessments/assessments.component')
            .then(m => m.AssessmentsComponent),
      },
      {
        path: 'assets/devices',
        redirectTo: 'assets/devices/dev-001',
        pathMatch: 'full',
      },
      {
        path: 'assets/devices/:deviceId',
        loadComponent: () =>
          import('./features/assets/device-detail/device-detail.component')
            .then(m => m.DeviceDetailComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
