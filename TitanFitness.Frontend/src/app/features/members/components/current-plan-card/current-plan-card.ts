import { Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { CurrentMembership } from '../../../../core/models/members/current-membership.model';
import { Button } from '../../../../shared/components/button/button';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';

@Component({
  selector: 'app-current-plan-card',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FontAwesomeModule, Button, StatusChip],
  templateUrl: './current-plan-card.html'
})
export class CurrentPlanCard {
  membership = input<CurrentMembership | null>(null);

  changePlan = output<void>();
  freezeMembership = output<void>();
  renewMembership = output<void>();

  readonly infoGlyph = faCircleInfo;
  readonly pauseGlyph = faSnowflake;

  hasLapsed = computed(() =>
    this.membership()?.status.toLowerCase() === 'expired'
  );

  pausable = computed(() =>
    this.membership()?.status.toLowerCase() === 'active'
  );
}
