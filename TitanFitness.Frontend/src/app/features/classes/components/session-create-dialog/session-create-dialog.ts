import { Component, computed, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendarPlus } from '@fortawesome/free-solid-svg-icons';
import { catchError, distinctUntilChanged, forkJoin, map, of, startWith, switchMap, tap } from 'rxjs';
import { BranchOption } from '../../../../core/models/branches/branch-option.model';
import { SessionCreateRequest } from '../../../../core/models/scheduling/session-create-request.model';
import { StudioOption } from '../../../../core/models/scheduling/studio-option.model';
import { TrainerOption } from '../../../../core/models/trainers/trainer-option.model';
import { SessionApiService } from '../../../../core/services/session-api.service';
import { StudioApiService } from '../../../../core/services/studio-api.service';
import { TrainerApiService } from '../../../../core/services/trainer-api.service';
import { Button } from '../../../../shared/components/button/button';
import { DialogShell } from '../../../../shared/components/dialog-shell/dialog-shell';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { FieldLabel } from '../../../../shared/components/field-label/field-label';
import { FieldMessage } from '../../../../shared/components/field-message/field-message';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { TextareaField } from '../../../../shared/components/textarea-field/textarea-field';

@Component({
  selector: 'app-session-create-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FontAwesomeModule,
    FeedbackBanner,
    Button,
    TextField,
    DialogShell,
    FieldLabel,
    FieldMessage,
    SelectField,
    TextareaField
  ],
  templateUrl: './session-create-dialog.html'
})
export class SessionCreateDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly studiosApi = inject(StudioApiService);
  private readonly trainersApi = inject(TrainerApiService);
  private readonly sessionsApi = inject(SessionApiService);

  branches = input.required<BranchOption[]>();
  defaultBranchId = input<number | null>(null);
  defaultDate = input.required<string>();

  closed = output<void>();
  created = output<{ branchId: number; date: string }>();

  rooms = signal<StudioOption[]>([]);
  coaches = signal<TrainerOption[]>([]);
  chosenRoom = signal<StudioOption | null>(null);

  fetchingChoices = signal(false);
  submitting = signal(false);
  failure = signal('');

  readonly scheduleGlyph = faCalendarPlus;

  readonly periods = [
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '60 min' }
  ];

  readonly form = this.fb.group({
    className: ['', [Validators.required, Validators.maxLength(100)]],
    branchId: [null as number | null, Validators.required],
    trainerId: [null as number | null, Validators.required],
    studioId: [null as number | null, Validators.required],
    sessionDate: ['', Validators.required],
    startTime: ['', Validators.required],
    durationMinutes: [45 as number | null, Validators.required],
    capacityLimit: [null as number | null, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.maxLength(500)]]
  });

  readonly pickFields = computed(() => [
    {
      label: 'Branch',
      control: this.form.controls.branchId,
      options: this.branches().map(site => ({ value: site.branchId, label: site.name })),
      placeholder: 'Select a branch',
      requiredMark: true,
      errorMessage: 'Branch is required.'
    },
    {
      label: 'Trainer / Instructor',
      control: this.form.controls.trainerId,
      options: this.coaches().map(coach => ({
        value: coach.trainerId,
        label: coach.specialty
          ? `${coach.name} — ${coach.specialty}`
          : coach.name
      })),
      placeholder: 'Select an instructor',
      requiredMark: true,
      errorMessage: 'Trainer is required.'
    },
    {
      label: 'Studio / Room',
      control: this.form.controls.studioId,
      options: this.rooms().map(room => ({ value: room.studioId, label: room.name })),
      placeholder: 'Assign a room',
      requiredMark: true,
      errorMessage: 'Studio is required.'
    }
  ]);

  capacityFailures(): string[] {
    const ctrl = this.form.controls.capacityLimit;

    if (!ctrl.touched)
      return [];

    const texts: string[] = [];

    if (ctrl.hasError('required'))
      texts.push('Capacity limit is required.');

    if (ctrl.hasError('min'))
      texts.push('Capacity must be greater than 0.');

    if (ctrl.hasError('max'))
      texts.push(`Capacity cannot exceed ${this.chosenRoom()?.capacity} spots.`);

    return texts;
  }

  ngOnInit(): void {
    this.form.patchValue({
      branchId: this.defaultBranchId(),
      sessionDate: this.defaultDate()
    }, { emitEvent: false });

    this.observeSite();
    this.observeRoom();
  }

  pickPeriod(period: number): void {
    this.form.controls.durationMinutes.setValue(period);
    this.form.controls.durationMinutes.markAsTouched();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const incoming = this.form.getRawValue();

    const lesson: SessionCreateRequest = {
      className: incoming.className!.trim(),
      branchId: incoming.branchId!,
      studioId: incoming.studioId!,
      trainerId: incoming.trainerId!,
      sessionDate: incoming.sessionDate!,
      startTime: incoming.startTime!,
      durationMinutes: incoming.durationMinutes!,
      capacityLimit: incoming.capacityLimit!,
      description: incoming.description?.trim() || null
    };

    this.submitting.set(true);
    this.failure.set('');

    this.sessionsApi.createClassSession(lesson)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);

          this.created.emit({ branchId: lesson.branchId, date: lesson.sessionDate });
        },
        error: failure => {
          this.submitting.set(false);
          this.failure.set(failure.message);
        }
      });
  }

  private observeSite(): void {
    this.form.controls.branchId.valueChanges
      .pipe(
        startWith(this.form.controls.branchId.value),
        distinctUntilChanged(),

        tap(() => {
          this.form.controls.studioId.setValue(null, { emitEvent: false });
          this.form.controls.trainerId.setValue(null, { emitEvent: false });
          this.form.controls.capacityLimit.setValue(null);

          this.rooms.set([]);
          this.coaches.set([]);
          this.chosenRoom.set(null);

          this.modifyCapacityValidator(null);
          this.failure.set('');
        }),

        switchMap(siteId => {
          if (!siteId)
            return of({ studios: [] as StudioOption[], trainers: [] as TrainerOption[] });

          this.fetchingChoices.set(true);

          return forkJoin({
            studios: this.studiosApi
              .getStudios(siteId)
              .pipe(map(reply => reply)),

            trainers: this.trainersApi
              .getAvailableTrainers(siteId)
              .pipe(map(reply => reply))
          })
            .pipe(
              catchError(failure => {
                this.failure.set(failure.message);

                return of({ studios: [] as StudioOption[], trainers: [] as TrainerOption[] });
              })
            );
        }),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(reply => {
        this.fetchingChoices.set(false);
        this.rooms.set(reply.studios);
        this.coaches.set(reply.trainers);
      });
  }

  private observeRoom(): void {
    this.form.controls.studioId.valueChanges
      .pipe(
        startWith(this.form.controls.studioId.value),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(roomId => {
        const room = this.rooms()
          .find(room => room.studioId === roomId) ?? null;

        this.chosenRoom.set(room);
        this.modifyCapacityValidator(room);
      });
  }

  private modifyCapacityValidator(room: StudioOption | null): void {
    const validators = [Validators.required, Validators.min(1)];

    if (room)
      validators.push(Validators.max(room.capacity));

    this.form.controls.capacityLimit
      .setValidators(validators);

    this.form.controls.capacityLimit
      .updateValueAndValidity({ emitEvent: false });
  }
}
