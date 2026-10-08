import { Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { MembershipDetailsRecord } from '../../../../core/models/memberships/membership-details.model';

@Component({
  selector: 'app-current-membership-panel',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './current-membership-panel.html'
})
export class CurrentMembershipPanel {
  membership = input.required<MembershipDetailsRecord>();

  readonly lockGlyph = faLock;

  readonly info = computed(() => {
    const membership = this.membership();

    return [
      { label: 'Plan', value: membership.planName },
      { label: 'Price paid', value: membership.pricePaid.toFixed(2) },
      { label: 'Duration', value: `${membership.durationInMonths} months` },
      { label: 'Access scope', value: membership.accessScope },
      { label: 'Max freeze days', value: membership.maximumFreezeDays.toString() },
      { label: 'Max number of freezes', value: membership.maximumNumberOfFreezes.toString() },
      { label: 'Guest pass quota', value: membership.guestPassQuota.toString() },
      {
        label: 'Start / End',
        value: `${this.formatDateText(membership.startDate)} → ${this.formatDateText(membership.endDate)}`
      }
    ];
  });

  private formatDateText(incoming: string): string {
    const [yearPart, monthPart, dayPart] = incoming.split('-').map(Number);

    return new Date(yearPart, monthPart - 1, dayPart).toLocaleDateString(
      'en-US',
      { month: 'short', day: 'numeric', year: 'numeric' }
    );
  }
} 
