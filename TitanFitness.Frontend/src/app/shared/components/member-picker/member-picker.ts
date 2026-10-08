import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { MemberDirectoryRecord } from '../../../core/models/members/member-directory-record.model';
import { EmptyState } from '../empty-state/empty-state';
import { FieldLabel } from '../field-label/field-label';
import { PersonSummaryCard } from '../person-summary-card/person-summary-card';

@Component({
  selector: 'app-member-picker',
  standalone: true,
  imports: [FieldLabel, ReactiveFormsModule, FontAwesomeModule, EmptyState, PersonSummaryCard],
  templateUrl: './member-picker.html'
})
export class MemberPicker {
  private readonly destroyRef = inject(DestroyRef);

  members = input.required<MemberDirectoryRecord[]>();
  loading = input(false);
  searched = input(false);

  searchChanged = output<string>();
  memberSelected = output<MemberDirectoryRecord>();

  readonly lookupGlyph = faMagnifyingGlass;
  readonly lookupControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.lookupControl.valueChanges
      .pipe(
        debounceTime(300),
        map(incoming => incoming.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(incoming =>
        this.searchChanged.emit(incoming)
      );
  }
}
