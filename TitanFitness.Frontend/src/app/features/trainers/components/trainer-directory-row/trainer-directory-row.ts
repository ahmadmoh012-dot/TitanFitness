import { Component, input, output } from '@angular/core';
import { TrainerDirectoryRecord } from '../../../../core/models/trainers/trainer-directory-record.model';
import { RowActionItem, RowActionMenu } from '../../../../shared/components/row-action-menu/row-action-menu';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';

export type TrainerRowAction = 'viewTrainer' | 'updateTrainer';

@Component({
  selector: 'tr[app-trainer-directory-row]',
  standalone: true,
  imports: [RowActionMenu, StatusChip],
  templateUrl: './trainer-directory-row.html'
})
export class TrainerDirectoryRow {
  trainer = input.required<TrainerDirectoryRecord>();
  actions = input.required<RowActionItem[]>();
  actionSelected = output<{ action: TrainerRowAction; trainerId: number }>();

  monogram(key: string): string {
    return key.trim().split(/\s+/).slice(0, 2).map(segment => segment[0]).join('').toUpperCase();
  }
  state(): string { return this.trainer().isActive ? 'Active' : 'Inactive'; }
  dispatchCommand(command: string): void {
    this.actionSelected.emit({ action: command as TrainerRowAction, trainerId: this.trainer().trainerId });
  }
}
