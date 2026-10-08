import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';
import { CurrentMembership } from '../../../../core/models/members/current-membership.model';
import { MemberActivityRecord } from '../../../../core/models/members/member-activity-record.model';
import { MemberProfileRecord } from '../../../../core/models/members/member-profile-record.model';
import { MemberApiService } from '../../../../core/services/member-api.service';
import { MembershipApiService } from '../../../../core/services/membership-api.service';
import { BackLink } from '../../../../shared/components/back-link/back-link';
import { Button } from '../../../../shared/components/button/button';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { ActivityFeed } from '../../components/activity-feed/activity-feed';
import { CurrentPlanCard } from '../../components/current-plan-card/current-plan-card';
import { MemberContactCard } from '../../components/member-contact-card/member-contact-card';
import { UsageMeterCard } from '../../components/usage-meter-card/usage-meter-card';

@Component({
  selector: 'app-member-overview',
  standalone: true,
  imports: [
    FeedbackBanner,
    BackLink,
    Button,
    LoadingState,
    CurrentPlanCard,
    MemberContactCard,
    ActivityFeed,
    UsageMeterCard
  ],
  templateUrl: './member-overview.html'
})
export class MemberOverview implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly membersApi = inject(MemberApiService);
  private readonly membershipsApi = inject(MembershipApiService);

  memberId = signal<number | null>(null);
  member = signal<MemberProfileRecord | null>(null);
  membership = signal<CurrentMembership | null>(null);
  activities = signal<MemberActivityRecord[]>([]);
  fetching = signal(true);
  failure = signal('');

  readonly usageTiles = computed(() => {
    const membership = this.membership();

    if (!membership)
      return [];

    return [
      {
        title: 'Freezes Used',
        used: membership.freezesUsed,
        allowed: membership.freezesAllowed,
        itemName: 'freeze'
      },
      {
        title: 'Guest Passes',
        used: membership.guestPassesUsed,
        allowed: membership.guestPassesAllowed,
        itemName: 'pass'
      }
    ];
  });

  ngOnInit(): void {
    const memberId = Number(this.route.snapshot.queryParamMap.get('memberId'));

    if (!Number.isInteger(memberId) || memberId <= 0) {
      this.router.navigate(['/members']);
      return;
    }

    this.memberId.set(memberId);
    this.fetchProfile(memberId);
  }

  goBack(): void {
    this.router.navigate(['/members']);
  }

  reviseProfile(): void {
    const memberId = this.memberId();

    if (!memberId)
      return;

    this.router.navigate(['/members/details'], { queryParams: { mode: 'edit', memberId } });
  }

  switchTier(): void {
    const membership = this.membership();

    if (!membership)
      return;

    this.router.navigate(['/members/change-plan'], {
      queryParams: { memberId: this.memberId(), membershipId: membership.membershipId }
    });
  }

  pauseMembership(): void {
    const membership = this.membership();

    if (!membership)
      return;

    this.router.navigate(['/members/freeze'], {
      queryParams: { memberId: this.memberId(), membershipId: membership.membershipId }
    });
  }

  renewMembership(): void {
    const membership = this.membership();
    const memberId = this.memberId();

    if (!membership || !memberId)
      return;

    this.failure.set('');

    this.membershipsApi.renewMembership(membership.membershipId)
      .subscribe({
        next: () =>
          this.fetchProfile(memberId),
        error: failure =>
          this.failure.set(failure.message)
      });
  }

  private fetchProfile(memberId: number): void {
    this.fetching.set(true);
    this.failure.set('');

    forkJoin({
      member: this.membersApi.getMemberById(memberId)
        .pipe(map(reply => reply)),

      membership: this.membersApi.getCurrentMembership(memberId)
        .pipe(map(reply => reply), catchError(() => of(null))),

      activities: this.membersApi.getMemberActivity(memberId)
        .pipe(
          map(reply => reply),
          catchError(failure => {
            this.creationFailure(failure.message);

            return of([]);
          })
        )
    })
      .pipe(finalize(() => this.fetching.set(false)))
      .subscribe({
        next: reply => {
          this.member.set(reply.member);
          this.membership.set(reply.membership);
          this.activities.set(reply.activities);
        },
        error: failure =>
          this.failure.set(failure.message)
      });
  }

  private creationFailure(text: string): void {
    const active = this.failure();

    if (!active) {
      this.failure.set(text);
      return;
    }

    if (!active.includes(text))
      this.failure.set(`${active} ${text}`);
  }
}
