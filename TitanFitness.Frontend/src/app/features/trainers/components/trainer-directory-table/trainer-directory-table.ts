import { Component, computed, input, output } from '@angular/core';
import { TrainerDirectoryRecord } from '../../../../core/models/trainers/trainer-directory-record.model';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Pager } from '../../../../shared/components/pager/pager';
import { RowActionItem } from '../../../../shared/components/row-action-menu/row-action-menu';
import { TrainerDirectoryRow, TrainerRowAction } from '../trainer-directory-row/trainer-directory-row';

export type TrainerAction = TrainerRowAction;

@Component({
  selector: 'app-trainer-directory-table', standalone: true,
  imports: [EmptyState, Pager, TrainerDirectoryRow], templateUrl: './trainer-directory-table.html'
})
export class TrainerDirectoryTable {
  trainers = input.required<TrainerDirectoryRecord[]>(); currentPage = input.required<number>(); totalPages = input.required<number>(); totalCount = input.required<number>(); pageSize = input(4);
  actionSelected = output<{ action: TrainerAction; trainerId: number }>(); pageChanged = output<number>();
  readonly commands: RowActionItem[] = [{ label: 'View Trainer', value: 'viewTrainer' }, { label: 'Update Trainer', value: 'updateTrainer' }];
  beginEntry = computed(() => this.totalCount() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1);
  finishEntry = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalCount()));
}
