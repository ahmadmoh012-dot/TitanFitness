import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    data: { title: 'Dashboard' },
    loadChildren: () => import('./features/dashboard/dashboard.routes')
      .then(module => module.DASHBOARD_FEATURE_ROUTES)
  },
  {
    path: 'members',
    data: { title: 'Members' },
    loadChildren: () => import('./features/members/members.routes')
      .then(module => module.MEMBER_FEATURE_ROUTES)
  },
  {
    path: 'classes',
    data: { title: 'Classes' },
    loadChildren: () => import('./features/classes/classes.routes')
      .then(module => module.CLASS_FEATURE_ROUTES)
  },
  {
    path: 'trainers',
    data: { title: 'Trainers' },
    loadChildren: () => import('./features/trainers/trainers.routes')
      .then(module => module.TRAINER_FEATURE_ROUTES)
  },
  {
    path: 'plans',
    data: { title: 'Plans' },
    loadChildren: () => import('./features/plans/plans.routes')
      .then(module => module.PLAN_FEATURE_ROUTES)
  },
  { path: '**', redirectTo: 'dashboard' }
];
