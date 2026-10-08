import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLocationDot, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { UpcomingSession } from '../../../../core/models/dashboard/upcoming-session.model';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';
import { TimeDisplayPipe } from '../../../../shared/pipes/time-display.pipe';

@Component({
  selector: 'app-upcoming-session-row',
  standalone: true,
  imports: [FontAwesomeModule, StatusChip, TimeDisplayPipe],
  templateUrl: './upcoming-session-row.html'
})
export class UpcomingSessionRow {
  session = input.required<UpcomingSession>();
  readonly locationGlyph = faLocationDot;
  readonly coachGlyph = faUser;
  readonly peopleGlyph = faUsers;
}
