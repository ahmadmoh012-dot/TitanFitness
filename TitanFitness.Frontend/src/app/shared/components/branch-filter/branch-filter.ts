import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BranchOption } from '../../../core/models/branches/branch-option.model';

@Component({
  selector: 'app-branch-filter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './branch-filter.html'
})
export class BranchFilter {
  branches = input.required<BranchOption[]>();
  selectedBranchId = input<number | null>(null);
  branchChanged = output<number | null>();

  propagateChange(siteId: number | null): void {
    this.branchChanged.emit(siteId);
  }
}
