import { Component, input, output } from '@angular/core';
import { BranchOption } from '../../../../core/models/branches/branch-option.model';
import { BranchFilter } from '../../../../shared/components/branch-filter/branch-filter';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-schedule-toolbar',
  standalone: true,
  imports: [BranchFilter, Button],
  templateUrl: './schedule-toolbar.html'
})
export class ScheduleToolbar {
  branches = input.required<BranchOption[]>();
  branchId = input<number | null>(null);
  date = input.required<string>();

  branchChanged = output<number | null>();
  dateChanged = output<string>();
  addClass = output<void>();

  handleDateChange(evt: Event): void {
    this.dateChanged.emit((evt.target as HTMLInputElement).value);
  }
}
