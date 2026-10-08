import { Component, computed, input, output } from '@angular/core';
import { PlanDetailsRecord } from '../../../../core/models/plans/plan-details.model';
import { Button } from '../../../../shared/components/button/button';
import { InfoBanner } from '../../../../shared/components/info-banner/info-banner';

@Component({
  selector: 'app-membership-terms-preview',
  standalone: true,
  imports: [Button, InfoBanner],
  templateUrl: './membership-terms-preview.html'
})
export class MembershipTermsPreview {
  plan = input<PlanDetailsRecord | null>(null);
  newEndDate = input('');
  saving = input(false);

  confirm = output<void>();
  cancel = output<void>();

  readonly details = computed(() => {
    const tier = this.plan();

    if (!tier)
      return [];

    return [
      { label: 'Plan', value: tier.planName },
      { label: 'Price', value: tier.price.toFixed(2) },
      { label: 'Duration', value: `${tier.durationInMonths} months` },
      { label: 'Max freeze days', value: tier.maxFreezeDays.toString() },
      { label: 'Max freezes', value: tier.maxFreezes.toString() },
      { label: 'Guest passes', value: tier.guestPassQuota.toString() },
      { label: 'Access scope', value: tier.accessScope },
      { label: 'New end date', value: this.formatDateText(this.newEndDate()) }
    ];
  });

  private formatDateText(incoming: string): string {
    if (!incoming)
      return '—';

    const [yearPart, monthPart, dayPart] = incoming.split('-').map(Number);

    return new Date(yearPart, monthPart - 1, dayPart).toLocaleDateString(
      'en-US',
      { month: 'short', day: 'numeric', year: 'numeric' }
    );
  }
}
