import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faPen } from '@fortawesome/free-solid-svg-icons';
import { finalize, take } from 'rxjs';
import { BranchOption } from '../../../../core/models/branches/branch-option.model';
import { TrainerDetailsRecord } from '../../../../core/models/trainers/trainer-details.model';
import { TrainerFormValue } from '../../../../core/models/trainers/trainer-form-value.model';
import { BranchApiService } from '../../../../core/services/branch-api.service';
import { TrainerApiService } from '../../../../core/services/trainer-api.service';
import { BackLink } from '../../../../shared/components/back-link/back-link';
import { Button } from '../../../../shared/components/button/button';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { FieldLabel } from '../../../../shared/components/field-label/field-label';
import { FieldMessage } from '../../../../shared/components/field-message/field-message';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { ModeChip } from '../../../../shared/components/mode-chip/mode-chip';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { TextField } from '../../../../shared/components/text-field/text-field';

type TrainerMode = 'create' | 'view' | 'edit';
type TrainerTextControl = 'name' | 'specialty' | 'email' | 'phone';
type TrainerInputType = 'text' | 'email' | 'tel';

type TrainerField =
  | {
    key: string;
    kind: 'text';
    control: TrainerTextControl;
    label: string;
    type: TrainerInputType;
    placeholder: string;
    requiredMark: boolean;
    errorMessage: string;
  }
  | {
    key: string;
    kind: 'branch';
    label: string;
  }
  | {
    key: string;
    kind: 'status';
    label: string;
  };

@Component({
  selector: 'app-trainer-editor',
  standalone: true,
  imports: [
    FieldMessage,
    FieldLabel,
    ReactiveFormsModule,
    FontAwesomeModule,
    FeedbackBanner,
    BackLink,
    Button,
    TextField,
    LoadingState,
    ModeChip,
    SelectField
  ],
  templateUrl: './trainer-editor.html'
})
export class TrainerEditor implements OnInit {
  private readonly trainersApi = inject(TrainerApiService);
  private readonly branchesApi = inject(BranchApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  sites = signal<BranchOption[]>([]);
  coach = signal<TrainerDetailsRecord | null>(null);

  mode = signal<TrainerMode>('create');
  coachId = signal<number | null>(null);

  sitesFetching = signal(true);
  coachFetching = signal(false);
  submitting = signal(false);

  siteFailure = signal('');
  coachFailure = signal('');
  submitFailure = signal('');

  readonly reviseGlyph = faPen;
  readonly submitGlyph = faCheck;

  readonly fields: TrainerField[] = [
    {
      key: 'name',
      kind: 'text',
      control: 'name',
      label: 'Trainer name',
      type: 'text',
      placeholder: 'e.g., Sarah Jenkins',
      requiredMark: true,
      errorMessage: 'Trainer name is required and cannot exceed 100 characters.'
    },
    {
      key: 'specialty',
      kind: 'text',
      control: 'specialty',
      label: 'Specialty',
      type: 'text',
      placeholder: 'e.g., HIIT / Strength',
      requiredMark: false,
      errorMessage: 'Specialty cannot exceed 100 characters.'
    },
    { key: 'branch', kind: 'branch', label: 'Branch' },
    {
      key: 'email',
      kind: 'text',
      control: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'name@titanfitness.com',
      requiredMark: false,
      errorMessage: 'Enter a valid email of no more than 100 characters.'
    },
    {
      key: 'phone',
      kind: 'text',
      control: 'phone',
      label: 'Phone',
      type: 'tel',
      placeholder: '+1 (555) 000-0000',
      requiredMark: false,
      errorMessage: 'Phone cannot exceed 20 characters.'
    },
    { key: 'status', kind: 'status', label: 'Status' }
  ];

  readonly form = this.fb.group({
    name: this.fb.control<string | null>('', [Validators.required, Validators.maxLength(100)]),
    branchId: this.fb.control<number | null>(null, Validators.required),
    specialty: this.fb.control<string | null>('', Validators.maxLength(100)),
    email: this.fb.control<string | null>('', [Validators.email, Validators.maxLength(100)]),
    phone: this.fb.control<string | null>('', Validators.maxLength(20)),
    isActive: this.fb.control(false, { nonNullable: true })
  });

  fetching = computed(() =>
    this.sitesFetching() ||
    this.coachFetching()
  );

  failure = computed(() =>
    this.siteFailure() ||
    this.coachFailure() ||
    this.submitFailure()
  );

  siteChoices = computed(() =>
    this.sites().map(site => ({ value: site.branchId, label: site.name }))
  );

  heading = computed(() =>
    this.mode() === 'create'
      ? 'New Trainer'
      : this.coach()?.name ?? 'Trainer Details'
  );

  subheading = computed(() =>
    this.mode() === 'create'
      ? 'Add a trainer to the roster.'
      : this.coach()?.trainerNumber ?? ''
  );

  badgeMode = computed<'add' | 'edit' | 'view'>(() =>
    this.mode() === 'create'
      ? 'add'
      : this.mode() === 'edit'
        ? 'edit'
        : 'view'
  );

  ngOnInit(): void {
    this.fetchSites();

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(queryMap => {
        const rawMode = queryMap.get('mode');

        const mode: TrainerMode =
          rawMode === 'view' || rawMode === 'edit'
            ? rawMode
            : 'create';

        const coachId = Number(queryMap.get('trainerId'));

        this.mode.set(mode);

        this.coachId.set(coachId > 0 ? coachId : null);

        this.submitFailure.set('');
        this.coachFailure.set('');

        if (mode === 'create') {
          this.prepareInsert();
          return;
        }

        if (coachId < 1) {
          this.coach.set(null);

          this.coachFailure.set('A trainer must be selected.');

          return;
        }

        if (this.coach()?.trainerId === coachId) {
          this.applyMode();
          return;
        }

        this.fetchCoach(coachId);
      });
  }

  save(): void {
    if (this.mode() === 'view')
      return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const incoming = this.form.getRawValue();

    const coach: TrainerFormValue = {
      name: incoming.name?.trim() ?? '',
      branchId: incoming.branchId!,
      specialty: incoming.specialty?.trim() || null,
      email: incoming.email?.trim() || null,
      phone: incoming.phone?.trim() || null,
      isActive: incoming.isActive
    };

    if (this.mode() === 'create') {
      this.submitting.set(true);
      this.submitFailure.set('');

      this.trainersApi.createTrainer(coach)
        .pipe(take(1), finalize(() => this.submitting.set(false)), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () =>
            this.router.navigate(['/trainers']),
          error: failure =>
            this.submitFailure.set(failure.message)
        });

      return;
    }

    const coachId = this.coachId();

    if (!coachId)
      return;

    this.submitting.set(true);
    this.submitFailure.set('');

    this.trainersApi.updateTrainer(coachId, coach)
      .pipe(take(1), finalize(() => this.submitting.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () =>
          this.router.navigate(['/trainers']),
        error: failure =>
          this.submitFailure.set(failure.message)
      });
  }

  reviseCoach(): void {
    const coachId = this.coachId();

    if (!coachId)
      return;

    this.router.navigate(['/trainers/details'], { queryParams: { mode: 'edit', trainerId: coachId } });
  }

  goBack(): void {
    this.router.navigate(['/trainers']);
  }

  abort(): void {
    this.router.navigate(['/trainers']);
  }

  private prepareInsert(): void {
    this.coach.set(null);
    this.coachFetching.set(false);

    this.form.enable({ emitEvent: false });

    this.form.reset({
      name: '',
      branchId: null,
      specialty: '',
      email: '',
      phone: '',
      isActive: false
    }, {
      emitEvent: false
    });
  }

  private applyMode(): void {
    this.form.enable({ emitEvent: false });

    if (this.mode() === 'view')
      this.form.disable({ emitEvent: false });
  }

  private fetchCoach(coachId: number): void {
    this.coachFetching.set(true);
    this.coachFailure.set('');
    this.coach.set(null);

    this.trainersApi.getTrainerById(coachId)
      .pipe(take(1), finalize(() => this.coachFetching.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: reply => {
          const coach = reply;

          this.coach.set(coach);

          this.form.patchValue({
            name: coach.name,
            branchId: coach.branchId,
            specialty: coach.specialty,
            email: coach.email,
            phone: coach.phone,
            isActive: coach.isActive
          }, {
            emitEvent: false
          });

          this.applyMode();
        },
        error: failure =>
          this.coachFailure.set(failure.message)
      });
  }

  private fetchSites(): void {
    this.sitesFetching.set(true);
    this.siteFailure.set('');

    this.branchesApi.getBranches()
      .pipe(take(1), finalize(() => this.sitesFetching.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: reply =>
          this.sites.set(reply),
        error: failure =>
          this.siteFailure.set(failure.message)
      });
  }
}
