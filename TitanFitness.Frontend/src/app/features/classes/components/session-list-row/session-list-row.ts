import { Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLocationDot, faUser } from '@fortawesome/free-solid-svg-icons';
import { SessionListRecord } from '../../../../core/models/scheduling/session-list-record.model';
import { Button } from '../../../../shared/components/button/button';
import { IconLabel } from '../../../../shared/components/icon-label/icon-label';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';
import { TimeDisplayPipe } from '../../../../shared/pipes/time-display.pipe';

@Component({
  selector: 'app-session-list-row',
  standalone: true,
  imports: [FontAwesomeModule, Button, IconLabel, StatusChip, TimeDisplayPipe],
  templateUrl: './session-list-row.html'
})
export class SessionListRow {
  session = input.required<SessionListRecord>();
  bookingMode = input(false);
  bookRequested = output<number>();

  readonly coachGlyph = faUser;
  readonly roomGlyph = faLocationDot;

  bookable = computed(() => {
    const state = this.session().status.trim().toLowerCase();
    return this.bookingMode() && (state === 'upcoming' || state === 'open');
  });

  fillPct = computed(() => {
    const row = this.session();
    return row.capacityLimit > 0 ? Math.min((row.bookedCount / row.capacityLimit) * 100, 100) : 0;
  });
}
