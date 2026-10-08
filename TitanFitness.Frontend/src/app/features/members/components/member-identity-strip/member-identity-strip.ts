import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MemberProfileRecord } from '../../../../core/models/members/member-profile-record.model';
import { MembershipDetailsRecord } from '../../../../core/models/memberships/membership-details.model';
import { ProfilePhoto } from '../../../../shared/components/profile-photo/profile-photo';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';

@Component({
  selector: 'app-member-identity-strip',
  standalone: true,
  imports: [DatePipe, ProfilePhoto, StatusChip],
  templateUrl: './member-identity-strip.html'
})
export class MemberIdentityStrip {
  member = input.required<MemberProfileRecord>();
  membership = input.required<MembershipDetailsRecord>();
  variant = input<'change-plan' | 'freeze'>('change-plan');
}
