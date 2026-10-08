import { Routes } from '@angular/router';
import { ScheduleBoard } from './pages/schedule-board/schedule-board';
import { SessionBooking } from './pages/session-booking/session-booking';

export const CLASS_FEATURE_ROUTES: Routes = [
  { path: '', component: ScheduleBoard, data: { title: 'Class Schedule' } },
  { path: 'book-session', component: SessionBooking, data: { title: 'Book Session' } }
];
