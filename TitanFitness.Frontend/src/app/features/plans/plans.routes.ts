import { Routes } from '@angular/router';
import { PlanCatalogue } from './pages/plan-catalogue/plan-catalogue';
import { PlanEditor } from './pages/plan-editor/plan-editor';

export const PLAN_FEATURE_ROUTES: Routes = [
  { path: '', component: PlanCatalogue, data: { title: 'Plan Catalogue' } },
  { path: 'details', component: PlanEditor, data: { title: 'Plan Details' } }
];
