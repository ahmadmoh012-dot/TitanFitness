import { Component, input, output } from '@angular/core';
import { MemberDirectoryRecord } from '../../../../core/models/members/member-directory-record.model';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { RowActionItem } from '../../../../shared/components/row-action-menu/row-action-menu';
import { MemberDirectoryRow, MemberRowAction } from '../member-directory-row/member-directory-row';

export type MemberAction = MemberRowAction;

@Component({
  selector: 'app-member-directory-table',
  standalone: true,
  imports: [EmptyState, MemberDirectoryRow],
  templateUrl: './member-directory-table.html'
})
export class MemberDirectoryTable {
  members = input.required<MemberDirectoryRecord[]>();
  actionSelected = output<{ action: MemberAction; memberId: number }>();

  readonly commands: RowActionItem[] = [
    { label: 'View Profile', value: 'viewProfile' },
    { label: 'Check-In', value: 'checkIn' },
    { label: 'Book Class', value: 'bookClass' },
    { label: 'Freeze Membership', value: 'freezeMembership' }
  ];
}
