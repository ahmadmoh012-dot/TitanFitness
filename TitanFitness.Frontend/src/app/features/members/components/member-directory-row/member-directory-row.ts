import { Component, input, output } from '@angular/core';
import { MemberDirectoryRecord } from '../../../../core/models/members/member-directory-record.model';
import { RowActionItem, RowActionMenu } from '../../../../shared/components/row-action-menu/row-action-menu';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';
import { ActivityDatePipe } from '../../../../shared/pipes/activity-date.pipe';

export type MemberRowAction = 'viewProfile' | 'checkIn' | 'bookClass' | 'freezeMembership';

@Component({
  selector: 'tr[app-member-directory-row]',
  standalone: true,
  imports: [ActivityDatePipe, RowActionMenu, StatusChip],
  templateUrl: './member-directory-row.html'
})
export class MemberDirectoryRow {
  member = input.required<MemberDirectoryRecord>();
  actions = input.required<RowActionItem[]>();
  actionSelected = output<{ action: MemberRowAction; memberId: number }>();

  monogram(key: string): string {
    const segments = key.trim().split(/\s+/).filter(Boolean);
    return segments.length > 1
      ? `${segments[0][0]}${segments[segments.length - 1][0]}`.toUpperCase()
      : (segments[0]?.slice(0, 2) ?? '').toUpperCase();
  }

  dispatchCommand(command: string): void {
    this.actionSelected.emit({ action: command as MemberRowAction, memberId: this.member().memberId });
  }
}
