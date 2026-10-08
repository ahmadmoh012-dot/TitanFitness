import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin, map, switchMap } from 'rxjs';
import { MemberProfileRecord } from '../../../../core/models/members/member-profile-record.model';
import { AvailablePlan } from '../../../../core/models/memberships/available-plan.model';
import { MembershipDetailsRecord } from '../../../../core/models/memberships/membership-details.model';
import { PlanSwitchMode } from '../../../../core/models/memberships/plan-switch-mode.model';
import { PlanDetailsRecord } from '../../../../core/models/plans/plan-details.model';
import { MemberApiService } from '../../../../core/services/member-api.service';
import { MembershipApiService } from '../../../../core/services/membership-api.service';
import { PlanApiService } from '../../../../core/services/plan-api.service';
import { BackLink } from '../../../../shared/components/back-link/back-link';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { ModeChip } from '../../../../shared/components/mode-chip/mode-chip';
import { CurrentMembershipPanel } from '../../components/current-membership-panel/current-membership-panel';
import { MemberIdentityStrip } from '../../components/member-identity-strip/member-identity-strip';
import { MembershipTermsPreview } from '../../components/membership-terms-preview/membership-terms-preview';
import { PlanChoice } from '../../components/plan-choice/plan-choice';
import { SwitchTimingOptions } from '../../components/switch-timing-options/switch-timing-options';

@Component({
  selector: 'app-plan-switch',
  standalone: true,
  imports: [
    FeedbackBanner,
    BackLink,
    LoadingState,
    ModeChip,
    MemberIdentityStrip,
    CurrentMembershipPanel,
    SwitchTimingOptions,
    MembershipTermsPreview,
    PlanChoice
  ],
  templateUrl: './plan-switch.html'
})
export class PlanSwitch implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly membersApi = inject(MemberApiService);
  private readonly membershipsApi = inject(MembershipApiService);
  private readonly plansApi = inject(PlanApiService);

  membershipId = signal<number | null>(null);
  member = signal<MemberProfileRecord | null>(null);
  membership = signal<MembershipDetailsRecord | null>(null);
  tiers = signal<AvailablePlan[]>([]);
  chosenTierId = signal<number | null>(null);
  chosenTier = signal<PlanDetailsRecord | null>(null);
  effectiveMode = signal(PlanSwitchMode.AtRenewal);
  newBeginDate = signal('');
  newFinishDate = signal('');
  fetching = signal(true);
  previewFetching = signal(false);
  submitting = signal(false);
  failure = signal('');

  ngOnInit(): void {
    const membershipId = Number(this.route.snapshot.queryParamMap.get('membershipId'));

    if (!Number.isInteger(membershipId) || membershipId <= 0) {
      this.router.navigate(['/members']);
      return;
    }

    this.membershipId.set(membershipId);
    this.fetchPage(membershipId);
  }

  goBack(): void {
    const memberId = this.member()?.memberId;

    if (memberId) {
      this.router.navigate(['/members/profile'], { queryParams: { memberId } });
      return;
    }

    this.router.navigate(['/members']);
  }

  pickTier(tierId: number | null): void {
    this.chosenTierId.set(tierId);
    this.chosenTier.set(null);
    this.newFinishDate.set('');

    if (!tierId)
      return;

    this.previewFetching.set(true);

    this.plansApi.getPlanById(tierId)
      .pipe(finalize(() => this.previewFetching.set(false)))
      .subscribe({
        next: reply => {
          this.chosenTier.set(reply);
          this.computeDates();
        },
        error: failure =>
          this.failure.set(failure.message)
      });
  }

  switchTiming(mode: PlanSwitchMode): void {
    this.effectiveMode.set(mode);
    this.computeDates();
  }

  finalizeChange(): void {
    const membershipId = this.membershipId();
    const tierId = this.chosenTierId();

    if (!membershipId || !tierId)
      return;

    this.submitting.set(true);
    this.failure.set('');

    this.membershipsApi.changePlan(membershipId, { newPlanId: tierId, effectiveMode: this.effectiveMode() })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({ next: () => this.goBack(), error: failure => this.failure.set(failure.message) });
  }

  private fetchPage(membershipId: number): void {
    this.fetching.set(true);
    this.failure.set('');

    this.membershipsApi.getMembershipById(membershipId)
      .pipe(
        map(reply => reply),
        switchMap(membership => {
          this.membership.set(membership);
          this.computeDates();

          return forkJoin({
            member: this.membersApi
              .getMemberById(membership.memberId)
              .pipe(map(reply => reply)),
            plans: this.membershipsApi
              .getAvailablePlans(membershipId)
              .pipe(map(reply => reply))
          });
        }),
        finalize(() =>
          this.fetching.set(false)
        )
      )
      .subscribe({
        next: reply => {
          this.member.set(reply.member);
          this.tiers.set(reply.plans);
        },
        error: failure =>
          this.failure.set(failure.message)
      });
  }

  private computeDates(): void {
    const membership = this.membership();

    if (!membership)
      return;

    let beginDate: Date;

    if (this.effectiveMode() === PlanSwitchMode.Immediately) {
      beginDate = new Date();
    } else {
      beginDate = this.readDate(membership.endDate);
      beginDate.setDate(beginDate.getDate() + 1);
    }

    this.newBeginDate.set(this.dateToText(beginDate));

    const tier = this.chosenTier();

    if (!tier) {
      this.newFinishDate.set('');
      return;
    }

    const finishDate = this.shiftMonths(beginDate, tier.durationInMonths);

    finishDate.setDate(finishDate.getDate() - 1);

    this.newFinishDate.set(this.dateToText(finishDate));
  }

  private readDate(incoming: string): Date {
    const [yearPart, monthPart, dayPart] = incoming
      .split('-')
      .map(Number);

    return new Date(yearPart, monthPart - 1, dayPart);
  }

  private shiftMonths(incoming: Date, months: number): Date {
    const dayPart = incoming.getDate();

    const outcome = new Date(incoming.getFullYear(), incoming.getMonth() + months, 1);

    const lastDay = new Date(outcome.getFullYear(), outcome.getMonth() + 1, 0).getDate();

    outcome.setDate(Math.min(dayPart, lastDay));

    return outcome;
  }

  private dateToText(incoming: Date): string {
    const yearPart = incoming.getFullYear();
    const monthPart = String(incoming.getMonth() + 1).padStart(2, '0');
    const dayPart = String(incoming.getDate()).padStart(2, '0');

    return `${yearPart}-${monthPart}-${dayPart}`;
  }
}
