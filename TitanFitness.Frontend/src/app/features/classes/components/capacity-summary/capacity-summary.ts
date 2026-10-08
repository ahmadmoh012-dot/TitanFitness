import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendarCheck, faUsers } from '@fortawesome/free-solid-svg-icons';
import { DayCapacitySummary } from '../../../../core/models/scheduling/day-capacity-summary.model';

@Component({
  selector: 'app-capacity-summary',
  standalone: true,
  imports: [DecimalPipe, FontAwesomeModule],
  templateUrl: './capacity-summary.html'
})
export class CapacitySummary {
  summary = input.required<DayCapacitySummary>();

  readonly reservationsGlyph = faUsers;
  readonly fillRateGlyph = faCalendarCheck;
}
