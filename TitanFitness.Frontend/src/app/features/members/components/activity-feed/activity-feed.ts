import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBolt, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { MemberActivityRecord } from '../../../../core/models/members/member-activity-record.model';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [DatePipe, FontAwesomeModule, EmptyState],
  templateUrl: './activity-feed.html'
})
export class ActivityFeed {
  activities = input.required<MemberActivityRecord[]>();

  readonly checkInGlyph = faRightToBracket;
  readonly classGlyph = faBolt;

  getGlyph(activityType: string): IconDefinition {
    return activityType.toLowerCase().includes('class')
      ? this.classGlyph
      : this.checkInGlyph;
  }
}
