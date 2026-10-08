import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PlanCatalogueRecord } from '../../../../core/models/plans/plan-catalog-record.model';
import { RowActionItem, RowActionMenu } from '../../../../shared/components/row-action-menu/row-action-menu';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';

export type PlanRowAction = 'viewPlan' | 'updatePlan';

@Component({
  selector: 'tr[app-plan-catalogue-row]',
  standalone: true,
  imports: [CurrencyPipe, RowActionMenu, StatusChip],
  templateUrl: './plan-catalogue-row.html'
})
export class PlanCatalogueRow {
  plan = input.required<PlanCatalogueRecord>();
  actions = input.required<RowActionItem[]>();
  actionSelected = output<{ action: PlanRowAction; planId: number }>();

  periodCaption(months: number): string {
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }

  pauseCaption(tier: PlanCatalogueRecord): string {
    if (tier.maxFreezeDays === 0 && tier.maxFreezes === 0) return 'None';
    return `${tier.maxFreezeDays} days / ${tier.maxFreezes} freezes`;
  }

  stateCaption(tier: PlanCatalogueRecord): string {
    return tier.isPublished ? 'Published' : 'Retired';
  }

  dispatchCommand(command: string): void {
    this.actionSelected.emit({ action: command as PlanRowAction, planId: this.plan().planId });
  }
}
