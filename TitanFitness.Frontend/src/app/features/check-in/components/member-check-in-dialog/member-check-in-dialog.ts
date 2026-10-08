import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { catchError, distinctUntilChanged, finalize, map, of, Subject, switchMap, take, tap } from 'rxjs';
import { BranchOption } from '../../../../core/models/branches/branch-option.model';
import { CheckInRequest } from '../../../../core/models/check-ins/check-in-request.model';
import { EntryDecision } from '../../../../core/models/members/entry-decision.model';
import { MemberDirectoryRecord } from '../../../../core/models/members/member-directory-record.model';
import { BranchApiService } from '../../../../core/services/branch-api.service';
import { CheckInApiService } from '../../../../core/services/check-in-api.service';
import { MemberApiService } from '../../../../core/services/member-api.service';
import { Button } from '../../../../shared/components/button/button';
import { DialogShell } from '../../../../shared/components/dialog-shell/dialog-shell';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { FieldLabel } from '../../../../shared/components/field-label/field-label';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { MemberPicker } from '../../../../shared/components/member-picker/member-picker';
import { PersonSummaryCard } from '../../../../shared/components/person-summary-card/person-summary-card';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { CheckInOverlayService } from '../../../../shared/services/check-in-overlay.service';
import { EntryVerdict } from '../entry-verdict/entry-verdict';

@Component({
  selector: 'app-member-check-in-dialog',
  standalone: true,
  imports: [
    FieldLabel,
    ReactiveFormsModule,
    FontAwesomeModule,
    FeedbackBanner,
    Button,
    LoadingState,
    MemberPicker,
    PersonSummaryCard,
    DialogShell,
    SelectField,
    EntryVerdict
  ],
  templateUrl: './member-check-in-dialog.html'
})
export class MemberCheckInDialog implements OnInit {
  private readonly branchesApi = inject(BranchApiService);
  private readonly membersApi = inject(MemberApiService);
  private readonly checkInsApi = inject(CheckInApiService);
  private readonly dialog = inject(CheckInOverlayService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private readonly memberLookup$ = new Subject<string>();
  private readonly eligibilityCheck$ =
    new Subject<{ memberId: number; branchId: number }>();

  sites = signal<BranchOption[]>([]);
  members = signal<MemberDirectoryRecord[]>([]);
  chosenMember = signal<MemberDirectoryRecord | null>(null);
  chosenSiteId = signal<number | null>(null);
  eligibility = signal<EntryDecision | null>(null);

  sitesFetching = signal(true);
  lookupFetching = signal(false);
  eligibilityFetching = signal(false);
  submitting = signal(false);
  lookupDone = signal(false);

  siteFailure = signal('');
  lookupFailure = signal('');
  eligibilityFailure = signal('');
  checkInFailure = signal('');

  failure = computed(() =>
    this.siteFailure() ||
    this.lookupFailure() ||
    this.eligibilityFailure() ||
    this.checkInFailure()
  );

  siteChoices = computed(() =>
    this.sites().map(site => ({ value: site.branchId, label: site.name }))
  );

  chosenSiteName = computed(() => {
    const siteId = this.chosenSiteId();

    return this.sites().find(site => site.branchId === siteId)?.name ?? 'the selected branch';
  });

  finalizable = computed(() =>
    !!this.chosenMember() &&
    !!this.chosenSiteId() &&
    !!this.eligibility() &&
    !this.eligibilityFetching() &&
    !this.submitting()
  );

  readonly checkInGlyph = faRightToBracket;

  readonly form = this.fb.group({ branchId: this.fb.control<number | null>(null, Validators.required) });

  ngOnInit(): void {
    this.chosenMember.set(this.dialog.member());

    this.observeMemberLookup();
    this.observeEligibility();
    this.observeSite();
    this.fetchSites();
  }

  lookupMembers(lookup: string): void {
    this.chosenMember.set(null);
    this.eligibility.set(null);
    this.eligibilityFailure.set('');
    this.checkInFailure.set('');

    this.memberLookup$.next(lookup);
  }

  pickMember(member: MemberDirectoryRecord): void {
    this.chosenMember.set(member);
    this.members.set([]);
    this.lookupDone.set(false);
    this.lookupFailure.set('');
    this.checkInFailure.set('');

    this.checkEligibility();
  }

  finalizeCheckIn(): void {
    const member = this.chosenMember();
    const siteId = this.chosenSiteId();

    if (!member || !siteId || !this.eligibility())
      return;

    const checkIn: CheckInRequest = { memberId: member.memberId, branchId: siteId };

    this.submitting.set(true);
    this.checkInFailure.set('');

    this.checkInsApi.createCheckIn(checkIn)
      .pipe(take(1), finalize(() => this.submitting.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () =>
          this.dialog.close(),

        error: failure =>
          this.checkInFailure.set(failure.message)
      });
  }

  dismiss(): void {
    if (this.submitting())
      return;

    this.dialog.close();
  }

  private fetchSites(): void {
    this.sitesFetching.set(true);
    this.siteFailure.set('');

    this.branchesApi.getBranches()
      .pipe(
        catchError(failure => {
          this.siteFailure.set(failure.message);

          return of([]);
        }),
        finalize(() =>
          this.sitesFetching.set(false)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(reply =>
        this.sites.set(reply)
      );
  }

  private observeSite(): void {
    this.form.controls.branchId.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(siteId => {
        this.chosenSiteId.set(siteId ? Number(siteId) : null);

        this.checkInFailure.set('');
        this.checkEligibility();
      });
  }

  private checkEligibility(): void {
    const member = this.chosenMember();
    const siteId = this.chosenSiteId();

    this.eligibility.set(null);
    this.eligibilityFailure.set('');

    if (!member || !siteId) {
      this.eligibilityFetching.set(false);
      return;
    }

    this.eligibilityCheck$.next({ memberId: member.memberId, branchId: siteId });
  }

  private observeEligibility(): void {
    this.eligibilityCheck$
      .pipe(
        tap(() => {
          this.eligibilityFetching.set(true);
          this.eligibility.set(null);
          this.eligibilityFailure.set('');
        }),

        switchMap(request =>
          this.membersApi
            .getEntryEligibility(request.memberId, request.branchId)
            .pipe(
              map(reply => ({ eligibility: reply, error: '' })),

              catchError(failure =>
                of({ eligibility: null, error: failure.message })
              )
            )
        ),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(outcome => {
        this.eligibilityFetching.set(false);
        this.eligibility.set(outcome.eligibility);
        this.eligibilityFailure.set(outcome.error);
      });
  }

  private observeMemberLookup(): void {
    this.memberLookup$
      .pipe(
        map(lookup => lookup.trim()),
        distinctUntilChanged(),

        tap(lookup => {
          this.lookupFailure.set('');
          this.members.set([]);

          this.lookupDone.set(lookup.length > 0);

          this.lookupFetching.set(lookup.length > 0);
        }),

        switchMap(lookup => {
          if (!lookup) {
            this.lookupFetching.set(false);

            return of([] as MemberDirectoryRecord[]);
          }

          return this.membersApi
            .getMembers(null, lookup, 1)
            .pipe(
              map(reply => {
                this.lookupFetching.set(false);

                return reply.items;
              }),

              catchError(failure => {
                this.lookupFetching.set(false);

                this.lookupFailure.set(failure.message);

                return of([] as MemberDirectoryRecord[]);
              })
            );
        }),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(members =>
        this.members.set(members)
      );
  }
}
