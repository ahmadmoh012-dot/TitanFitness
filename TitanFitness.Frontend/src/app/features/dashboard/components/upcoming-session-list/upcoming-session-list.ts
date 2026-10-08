import { Component, input, output } from '@angular/core';
import { UpcomingSession } from '../../../../core/models/dashboard/upcoming-session.model';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { UpcomingSessionRow } from '../upcoming-session-row/upcoming-session-row';

@Component({
  selector: 'app-upcoming-session-list',
  standalone: true,
  imports: [EmptyState, UpcomingSessionRow],
  templateUrl: './upcoming-session-list.html'
})
export class UpcomingSessionList {
  classes = input.required<UpcomingSession[]>();
  viewSchedule = output<void>();
}
