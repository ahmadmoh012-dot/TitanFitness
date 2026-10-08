import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendarDays, faEnvelope, faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import { MemberProfileRecord } from '../../../../core/models/members/member-profile-record.model';
import { ProfilePhoto } from '../../../../shared/components/profile-photo/profile-photo';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';

@Component({
  selector: 'app-member-contact-card',
  standalone: true,
  imports: [DatePipe, FontAwesomeModule, ProfilePhoto, StatusChip],
  templateUrl: './member-contact-card.html'
})
export class MemberContactCard {
  member = input.required<MemberProfileRecord>();
  status = input('No Membership');

  readonly emailGlyph = faEnvelope;
  readonly phoneGlyph = faPhone;
  readonly locationGlyph = faLocationDot;
  readonly dateGlyph = faCalendarDays;
}
