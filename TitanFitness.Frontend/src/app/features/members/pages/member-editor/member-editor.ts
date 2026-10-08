import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { BranchOption } from '../../../../core/models/branches/branch-option.model';
import { MemberCreateRequest } from '../../../../core/models/members/member-create-request.model';
import { MemberUpdateRequest } from '../../../../core/models/members/member-update-request.model';
import { BranchApiService } from '../../../../core/services/branch-api.service';
import { MemberApiService } from '../../../../core/services/member-api.service';
import { BackLink } from '../../../../shared/components/back-link/back-link';
import { Button } from '../../../../shared/components/button/button';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { InfoBanner } from '../../../../shared/components/info-banner/info-banner';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { ModeChip } from '../../../../shared/components/mode-chip/mode-chip';
import { ProfilePhoto } from '../../../../shared/components/profile-photo/profile-photo';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { TextField } from '../../../../shared/components/text-field/text-field';

@Component({
  selector: 'app-member-editor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FeedbackBanner,
    BackLink,
    Button,
    TextField,
    InfoBanner,
    LoadingState,
    ProfilePhoto,
    ModeChip,
    SelectField
  ],
  templateUrl: './member-editor.html'
})
export class MemberEditor implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly branchesApi = inject(BranchApiService);
  private readonly membersApi = inject(MemberApiService);

  mode = signal<'create' | 'edit'>('create');
  memberId = signal<number | null>(null);
  sites = signal<BranchOption[]>([]);
  fetching = signal(false);
  submitting = signal(false);
  failure = signal('');

  readonly inEditMode = computed(() =>
    this.mode() === 'edit'
  );

  readonly siteChoices = computed(() =>
    this.sites().map(site => ({ value: site.branchId, label: site.name }))
  );

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    membershipNumber: ['', [Validators.maxLength(10)]],
    email: ['', [Validators.email, Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(20)]],
    address: ['', [Validators.maxLength(200)]],
    joinedDate: ['', Validators.required],
    homeBranchId: [null as number | null, Validators.required],
    photo: ['']
  });

  readonly fields = computed(() => [
    {
      label: 'Full Name',
      control: this.form.controls.fullName,
      type: 'text' as const,
      placeholder: 'e.g., Jane Doe',
      helper: '',
      requiredMark: true,
      readonly: false,
      errorMessage: 'Full name is required.',
      col: 'col-12 col-md-6'
    },
    {
      label: 'Membership Number',
      control: this.form.controls.membershipNumber,
      type: 'text' as const,
      placeholder: 'TF-____',
      helper: this.inEditMode()
        ? 'Unique and never changes once the member is created.'
        : 'Unique, max 10 characters (e.g. TF-8932). Generated automatically if left blank.',
      requiredMark: false,
      readonly: this.inEditMode(),
      errorMessage: '',
      col: 'col-12 col-md-6'
    },
    {
      label: 'Email',
      control: this.form.controls.email,
      type: 'email' as const,
      placeholder: 'name@email.com',
      helper: '',
      requiredMark: false,
      readonly: false,
      errorMessage: 'Enter a valid email address.',
      col: 'col-12 col-md-6'
    },
    {
      label: 'Phone',
      control: this.form.controls.phone,
      type: 'tel' as const,
      placeholder: '+1 (555) 000-0000',
      helper: '',
      requiredMark: false,
      readonly: false,
      errorMessage: '',
      col: 'col-12 col-md-6'
    },
    {
      label: 'Address',
      control: this.form.controls.address,
      type: 'text' as const,
      placeholder: 'Street, city, apt.',
      helper: '',
      requiredMark: false,
      readonly: false,
      errorMessage: '',
      col: 'col-12'
    },
    {
      label: 'Joined Date',
      control: this.form.controls.joinedDate,
      type: 'date' as const,
      placeholder: '',
      helper: '',
      requiredMark: true,
      readonly: false,
      errorMessage: 'Joined date is required.',
      col: 'col-12 col-md-6'
    }
  ]);

  ngOnInit(): void {
    const mode = this.route.snapshot.queryParamMap.get('mode');
    const memberId = this.route.snapshot.queryParamMap.get('memberId');

    this.mode.set(mode === 'edit' ? 'edit' : 'create');

    if (this.inEditMode()) {
      const recordId = Number(memberId);

      if (!Number.isInteger(recordId) || recordId <= 0) {
        this.router.navigate(['/members']);
        return;
      }

      this.memberId.set(recordId);
    }

    this.fetchSites();

    if (this.inEditMode())
      this.fetchMember(this.memberId()!);
  }

  handlePhotoChosen(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const chosenFile = input.files?.[0];

    if (!chosenFile)
      return;

    if (!chosenFile.type.startsWith('image/')) {
      this.failure.set('Please select a valid image file.');
      input.value = '';
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = () => {
      this.form.controls.photo.setValue(fileReader.result as string);
      this.form.controls.photo.markAsDirty();
      this.failure.set('');
      input.value = '';
    };

    fileReader.onerror = () => {
      this.failure.set('Unable to read the selected photo.');
      input.value = '';
    };

    fileReader.readAsDataURL(chosenFile);
  }

  goBack(): void {
    const memberId = this.memberId();

    if (this.inEditMode() && memberId) {
      this.router.navigate(['/members/profile'], { queryParams: { memberId } });
      return;
    }

    this.router.navigate(['/members']);
  }

  abort(): void {
    this.goBack();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.inEditMode()) {
      this.modifyMember();
      return;
    }

    this.insertMember();
  }

  private insertMember(): void {
    const incoming = this.form.getRawValue();

    const member: MemberCreateRequest = {
      membershipNumber: incoming.membershipNumber?.trim() || null,
      fullName: incoming.fullName!.trim(),
      email: incoming.email?.trim() || null,
      phone: incoming.phone?.trim() || null,
      address: incoming.address?.trim() || null,
      joinedDate: incoming.joinedDate!,
      photo: incoming.photo?.trim() || null,
      homeBranchId: incoming.homeBranchId!
    };

    this.submitting.set(true);
    this.failure.set('');

    this.membersApi.createMember(member)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: reply =>
          this.router.navigate(['/members/profile'], { queryParams: { memberId: reply } }),
        error: failure =>
          this.failure.set(failure.message)
      });
  }

  private modifyMember(): void {
    const memberId = this.memberId();

    if (!memberId)
      return;

    const incoming = this.form.getRawValue();

    const member: MemberUpdateRequest = {
      fullName: incoming.fullName!.trim(),
      email: incoming.email?.trim() || null,
      phone: incoming.phone?.trim() || null,
      address: incoming.address?.trim() || null,
      joinedDate: incoming.joinedDate!,
      photo: incoming.photo?.trim() || null,
      homeBranchId: incoming.homeBranchId!
    };

    this.submitting.set(true);
    this.failure.set('');

    this.membersApi.updateMember(memberId, member)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () =>
          this.router.navigate(['/members/profile'], { queryParams: { memberId } }),
        error: failure =>
          this.failure.set(failure.message)
      });
  }

  private fetchMember(memberId: number): void {
    this.fetching.set(true);
    this.failure.set('');

    this.membersApi.getMemberById(memberId)
      .pipe(finalize(() => this.fetching.set(false)))
      .subscribe({
        next: reply => {
          const member = reply;

          this.form.patchValue({
            fullName: member.fullName,
            membershipNumber: member.membershipNumber,
            email: member.email,
            phone: member.phone,
            address: member.address,
            joinedDate: member.joinedDate,
            homeBranchId: member.homeBranchId,
            photo: member.photo
          });
        },
        error: failure =>
          this.failure.set(failure.message)
      });
  }

  private fetchSites(): void {
    this.branchesApi.getBranches()
      .subscribe({
        next: reply =>
          this.sites.set(reply),
        error: failure =>
          this.failure.set(failure.message)
      });
  }
}
