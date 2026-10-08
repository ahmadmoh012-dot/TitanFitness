import { Component, input, output } from '@angular/core';
import { SessionListRecord } from '../../../../core/models/scheduling/session-list-record.model';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { SessionListRow } from '../session-list-row/session-list-row';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [EmptyState, SessionListRow],
  templateUrl: './session-list.html'
})
export class SessionList {
  sessions = input.required<SessionListRecord[]>();
  totalCount = input(0);
  bookingMode = input(false);
  bookRequested = output<number>();
}
