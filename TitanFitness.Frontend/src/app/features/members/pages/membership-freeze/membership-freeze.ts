import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, switchMap } from 'rxjs';
import { MemberProfileRecord } from '../../../../core/models/members/member-profile-record.model';
import { MembershipDetailsRecord } from '../../../../core/models/memberships/membership-details.model';
import { MembershipFreezeRequest } from '../../../../core/models/memberships/membership-freeze-request.model';
import { MemberApiService } from '../../../../core/services/member-api.service';
import { MembershipApiService } from '../../../../core/services/membership-api.service';
import { BackLink } from '../../../../shared/components/back-link/back-link';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { FreezeImpact } from '../../components/freeze-impact/freeze-impact';
import { FreezeOptions } from '../../components/freeze-options/freeze-options';
import { MemberIdentityStrip } from '../../components/member-identity-strip/member-identity-strip';

@Component({
  selector: 'app-membership-freeze',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FeedbackBanner,
    BackLink,
    LoadingState,
    MemberIdentityStrip,
    FreezeOptions,
    FreezeImpact
  ],
  templateUrl: './membership-freeze.html'
})
export class MembershipFreeze implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly membersApi = inject(MemberApiService);
  private readonly membershipsApi = inject(MembershipApiService);

  membershipId = signal<number | null>(null);
  member = signal<MemberProfileRecord | null>(null);
  membership = signal<MembershipDetailsRecord | null>(null);
  fetching = signal(true);
  submitting = signal(false);
  failure = signal('');

  readonly periodChoices = [
    { id: 1, label: '1 Month', months: 1 },
    { id: 2, label: '2 Months', months: 2 },
    { id: 3, label: '3 Months', months: 3 }
  ];

  readonly causeChoices = [
    { id: 1, label: 'Extended Travel' },
    { id: 2, label: 'Injury' },
    { id: 3, label: 'Other' }
  ];

  readonly minBeginDate = this.currentDay();

  readonly formGroup = this.fb.group({
    startDate: [this.currentDay(), Validators.required],
    freezeDurationId: [null as number | null, Validators.required],
    freezeReasonId: [null as number | null, Validators.required],
    notes: ['', [Validators.maxLength(200)]]
  });

  private readonly formValue = toSignal(
    this.formGroup.valueChanges,
    { initialValue: this.formGroup.getRawValue() }
  );

  readonly chosenPeriod = computed(() => {
    const periodId = this.formValue().freezeDurationId;

    return this.periodChoices.find(period => period.id === periodId) ?? null;
  });

  readonly projectedFinishDate = computed(() => {
    const membership = this.membership();
    const beginDate = this.formValue().startDate;
    const period = this.chosenPeriod();

    if (!membership || !beginDate || !period)
      return '';

    const pauseBegin = this.readDate(beginDate);
    const pauseFinish = this.shiftMonths(pauseBegin, period.months);

    pauseFinish.setUTCDate(pauseFinish.getUTCDate() - 1);

    const pausedDays =
      Math.round((pauseFinish.getTime() - pauseBegin.getTime()) / 86400000) + 1;

    const activeFinish = this.readDate(membership.endDate);

    activeFinish.setUTCDate(activeFinish.getUTCDate() + pausedDays);

    return this.dateToText(activeFinish);
  });

  ngOnInit(): void {
    const membershipId = Number(this.route.snapshot.queryParamMap.get('membershipId'));

    if (
      !Number.isInteger(membershipId) ||
      membershipId <= 0
    ) {
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

  finalizePause(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const membershipId = this.membershipId();

    if (!membershipId)
      return;

    const incoming = this.formGroup.getRawValue();

    const pause: MembershipFreezeRequest = {
      startDate: incoming.startDate!,
      freezeDurationId: incoming.freezeDurationId!,
      freezeReasonId: incoming.freezeReasonId!,
      notes: incoming.notes?.trim() || null
    };

    this.submitting.set(true);
    this.failure.set('');

    this.membershipsApi.addFreeze(membershipId, pause)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({ next: () => this.goBack(), error: failure => this.failure.set(failure.message) });
  }

  private fetchPage(membershipId: number): void {
    this.fetching.set(true);
    this.failure.set('');

    this.membershipsApi
      .getMembershipById(membershipId)
      .pipe(
        map(reply => reply),
        switchMap(membership => {
          this.membership.set(membership);

          return this.membersApi.getMemberById(membership.memberId);
        }),
        finalize(() =>
          this.fetching.set(false)
        )
      )
      .subscribe({
        next: reply =>
          this.member.set(reply),
        error: failure =>
          this.failure.set(failure.message)
      });
  }

  private currentDay(): string {
    const currentDay = new Date();
    const yearPart = currentDay.getFullYear();
    const monthPart = String(currentDay.getMonth() + 1).padStart(2, '0');
    const dayPart = String(currentDay.getDate()).padStart(2, '0');

    return `${yearPart}-${monthPart}-${dayPart}`;
  }

  private readDate(incoming: string): Date {
    const [yearPart, monthPart, dayPart] = incoming
      .split('-')
      .map(Number);

    return new Date(Date.UTC(yearPart, monthPart - 1, dayPart));
  }

  private shiftMonths(
    incoming: Date,
    months: number
  ): Date {
    const dayPart = incoming.getUTCDate();

    const outcome = new Date(Date.UTC(incoming.getUTCFullYear(), incoming.getUTCMonth() + months, 1));

    const lastDay = new Date(Date.UTC(outcome.getUTCFullYear(), outcome.getUTCMonth() + 1, 0)).getUTCDate();

    outcome.setUTCDate(Math.min(dayPart, lastDay));

    return outcome;
  }

  private dateToText(incoming: Date): string {
    const yearPart = incoming.getUTCFullYear();
    const monthPart = String(incoming.getUTCMonth() + 1).padStart(2, '0');
    const dayPart = String(incoming.getUTCDate()).padStart(2, '0');

    return `${yearPart}-${monthPart}-${dayPart}`;
  }
}
