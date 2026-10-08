import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faPen } from '@fortawesome/free-solid-svg-icons';
import { finalize, take } from 'rxjs';
import { PlanDetailsRecord } from '../../../../core/models/plans/plan-details.model';
import { PlanSaveRequest } from '../../../../core/models/plans/plan-save-request.model';
import { PlanApiService } from '../../../../core/services/plan-api.service';
import { BackLink } from '../../../../shared/components/back-link/back-link';
import { Button } from '../../../../shared/components/button/button';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { ModeChip } from '../../../../shared/components/mode-chip/mode-chip';
import { PlanBenefitsForm } from '../../components/plan-benefits-form/plan-benefits-form';
import { PlanCoreForm } from '../../components/plan-core-form/plan-core-form';

type PlanMode = 'create' | 'view' | 'edit';

@Component({
  selector: 'app-plan-editor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FontAwesomeModule,
    FeedbackBanner,
    BackLink,
    Button,
    LoadingState,
    ModeChip,
    PlanCoreForm,
    PlanBenefitsForm
  ],
  templateUrl: './plan-editor.html'
})
export class PlanEditor implements OnInit {
  private readonly plansApi = inject(PlanApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  tier = signal<PlanDetailsRecord | null>(null);
  mode = signal<PlanMode>('create');
  tierId = signal<number | null>(null);

  fetching = signal(false);
  submitting = signal(false);

  fetchFailure = signal('');
  submitFailure = signal('');

  readonly reviseGlyph = faPen;
  readonly submitGlyph = faCheck;

  readonly form = this.fb.group({
    planName: this.fb.control<string | null>(
      '',
      [Validators.required, Validators.maxLength(50)]
    ),
    price: this.fb.control<number | null>(
      0,
      [Validators.required, Validators.min(0)]
    ),
    durationInMonths: this.fb.control<number | null>(
      null,
      [Validators.required, Validators.min(1)]
    ),
    maxFreezeDays: this.fb.control<number | null>(
      0,
      Validators.min(0)
    ),
    maxFreezes: this.fb.control<number | null>(
      0,
      Validators.min(0)
    ),
    guestPassQuota: this.fb.control<number | null>(
      0,
      Validators.min(0)
    ),
    accessScope: this.fb.control<number | null>(
      null,
      Validators.required
    ),
    isPublished: this.fb.control(false, {
      nonNullable: true
    })
  });

  failure = computed(() =>
    this.fetchFailure() || this.submitFailure()
  );

  heading = computed(() =>
    this.mode() === 'create'
      ? 'New Plan'
      : this.tier()?.planName ?? 'Plan Details'
  );

  subheading = computed(() =>
    this.mode() === 'create'
      ? 'Publish a new membership plan.'
      : 'Plan details'
  );

  badgeMode = computed<'add' | 'edit' | 'view'>(() => {
    if (this.mode() === 'create')
      return 'add';

    if (this.mode() === 'edit')
      return 'edit';

    return 'view';
  });

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(queryMap => {
        const rawMode = queryMap.get('mode');

        const currentMode: PlanMode =
          rawMode === 'view' || rawMode === 'edit'
            ? rawMode
            : 'create';

        const planId = Number(
          queryMap.get('planId')
        );

        this.mode.set(currentMode);

        this.tierId.set(
          planId > 0
            ? planId
            : null
        );

        this.fetchFailure.set('');
        this.submitFailure.set('');

        if (currentMode === 'create') {
          this.prepareInsert();
          return;
        }

        if (planId < 1) {
          this.tier.set(null);
          this.fetchFailure.set(
            'A plan must be selected.'
          );
          return;
        }

        if (this.tier()?.planId === planId) {
          this.applyMode();
          return;
        }

        this.fetchTier(planId);
      });
  }

  save(): void {
    if (this.mode() === 'view')
      return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    const request: PlanSaveRequest = {
      planName:
        values.planName?.trim() ?? '',
      price:
        values.price!,
      durationInMonths:
        values.durationInMonths!,
      maxFreezeDays:
        values.maxFreezeDays ?? 0,
      maxFreezes:
        values.maxFreezes ?? 0,
      guestPassQuota:
        values.guestPassQuota ?? 0,
      accessScope:
        Number(values.accessScope),
      isPublished:
        values.isPublished
    };

    if (this.mode() === 'create') {
      this.insertTier(request);
      return;
    }

    const planId = this.tierId();

    if (!planId)
      return;

    this.modifyTier(
      planId,
      request
    );
  }

  reviseTier(): void {
    const planId = this.tierId();

    if (!planId)
      return;

    this.router.navigate(
      ['/plans/details'],
      {
        queryParams: {
          mode: 'edit',
          planId
        }
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/plans']);
  }

  abort(): void {
    this.router.navigate(['/plans']);
  }

  private insertTier(
    request: PlanSaveRequest
  ): void {
    this.submitting.set(true);
    this.submitFailure.set('');

    this.plansApi
      .createPlan(request)
      .pipe(
        take(1),
        finalize(() =>
          this.submitting.set(false)
        ),
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: () =>
          this.router.navigate(['/plans']),

        error: failure =>
          this.submitFailure.set(
            failure.message
          )
      });
  }

  private modifyTier(
    planId: number,
    request: PlanSaveRequest
  ): void {
    this.submitting.set(true);
    this.submitFailure.set('');

    this.plansApi
      .updatePlan(
        planId,
        request
      )
      .pipe(
        take(1),
        finalize(() =>
          this.submitting.set(false)
        ),
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: () =>
          this.router.navigate(['/plans']),

        error: failure =>
          this.submitFailure.set(
            failure.message
          )
      });
  }

  private prepareInsert(): void {
    this.tier.set(null);
    this.fetching.set(false);

    this.form.enable({
      emitEvent: false
    });

    this.form.reset(
      {
        planName: '',
        price: 0,
        durationInMonths: null,
        maxFreezeDays: 0,
        maxFreezes: 0,
        guestPassQuota: 0,
        accessScope: null,
        isPublished: false
      },
      {
        emitEvent: false
      }
    );
  }

  private fetchTier(
    planId: number
  ): void {
    this.fetching.set(true);
    this.fetchFailure.set('');
    this.tier.set(null);

    this.plansApi
      .getPlanById(planId)
      .pipe(
        take(1),
        finalize(() =>
          this.fetching.set(false)
        ),
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: plan => {
          this.tier.set(plan);

          this.form.patchValue(
            {
              planName:
                plan.planName,

              price:
                plan.price,

              durationInMonths:
                plan.durationInMonths,

              maxFreezeDays:
                plan.maxFreezeDays,

              maxFreezes:
                plan.maxFreezes,

              guestPassQuota:
                plan.guestPassQuota,

              accessScope:
                Number(plan.accessScope),

              isPublished:
                plan.isPublished
            },
            {
              emitEvent: false
            }
          );

          this.applyMode();
        },

        error: failure =>
          this.fetchFailure.set(
            failure.message
          )
      });
  }

  private applyMode(): void {
    this.form.enable({
      emitEvent: false
    });

    if (this.mode() === 'view') {
      this.form.disable({
        emitEvent: false
      });
    }
  }
}
