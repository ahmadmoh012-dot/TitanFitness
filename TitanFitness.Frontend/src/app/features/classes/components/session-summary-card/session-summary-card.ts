import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClock, faLocationDot, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { SessionDetails } from '../../../../core/models/scheduling/session-details.model';
import { IconLabel } from '../../../../shared/components/icon-label/icon-label';

@Component({
  selector: 'app-session-summary-card',
  standalone: true,
  imports: [FontAwesomeModule, IconLabel],
  templateUrl: './session-summary-card.html'
})
export class SessionSummaryCard {
  session = input.required<SessionDetails>();

  readonly clockGlyph = faClock;
  readonly coachGlyph = faUser;
  readonly roomGlyph = faLocationDot;
  readonly capacityGlyph = faUsers;

  beginTime(): string {
    return this.session().startTime.slice(0, 5);
  }

  finishTime(): string {
    const [hours, minutes] = this.session()
      .startTime
      .split(':')
      .map(Number);

    const date = new Date();
    date.setHours(hours, minutes + this.session().durationMinutes, 0, 0);

    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  dayCaption(): string {
    const lessonDate = new Date(
      `${this.session().sessionDate}T00:00:00`
    );

    const currentDay = new Date();

    if (
      lessonDate.getFullYear() === currentDay.getFullYear() &&
      lessonDate.getMonth() === currentDay.getMonth() &&
      lessonDate.getDate() === currentDay.getDate()
    )
      return 'Today';

    return lessonDate.toLocaleDateString();
  }
}
