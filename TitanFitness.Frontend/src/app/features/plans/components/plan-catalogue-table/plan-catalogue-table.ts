import { Component, computed, input, output } from '@angular/core';
import { PlanCatalogueRecord } from '../../../../core/models/plans/plan-catalog-record.model';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Pager } from '../../../../shared/components/pager/pager';
import { RowActionItem } from '../../../../shared/components/row-action-menu/row-action-menu';
import { PlanCatalogueRow, PlanRowAction } from '../plan-catalogue-row/plan-catalogue-row';

export type PlanAction = PlanRowAction;

@Component({
  selector: 'app-plan-catalogue-table',
  standalone: true,
  imports: [EmptyState, Pager, PlanCatalogueRow],
  templateUrl: './plan-catalogue-table.html'
})
export class PlanCatalogueTable {
  plans = input.required<PlanCatalogueRecord[]>();
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  totalCount = input.required<number>();
  pageSize = input(4);
  actionSelected = output<{ action: PlanAction; planId: number }>();
  pageChanged = output<number>();

  readonly commands: RowActionItem[] = [
    { label: 'View Plan', value: 'viewPlan' },
    { label: 'Update Plan', value: 'updatePlan' }
  ];

  beginEntry = computed(() => this.totalCount() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1);
  finishEntry = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalCount()));
}
