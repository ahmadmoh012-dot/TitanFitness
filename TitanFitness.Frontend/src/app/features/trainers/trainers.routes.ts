import { Routes } from '@angular/router';
import { TrainerDirectory } from './pages/trainer-directory/trainer-directory';
import { TrainerEditor } from './pages/trainer-editor/trainer-editor';

export const TRAINER_FEATURE_ROUTES: Routes = [
  { path: '', component: TrainerDirectory, data: { title: 'Trainer Directory' } },
  { path: 'details', component: TrainerEditor, data: { title: 'Trainer Details' } }
];
