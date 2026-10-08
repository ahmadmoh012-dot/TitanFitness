import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldLabel } from '../../../../shared/components/field-label/field-label';

@Component({
  selector: 'app-freeze-options',
  standalone: true,
  imports: [
    FieldLabel,ReactiveFormsModule],
  templateUrl: './freeze-options.html'
})
export class FreezeOptions {
  startDate = input.required<FormControl<string | null>>();
  freezeDurationId = input.required<FormControl<number | null>>();
  freezeReasonId = input.required<FormControl<number | null>>();
  notes = input.required<FormControl<string | null>>();

  durations = input.required<ReadonlyArray<{
    id: number;
    label: string;
    months: number;
  }>>();

  reasons = input.required<ReadonlyArray<{
    id: number;
    label: string;
  }>>();

  minStartDate = input.required<string>();

  pickPeriod(recordId: number): void {
    this.freezeDurationId().setValue(recordId);
    this.freezeDurationId().markAsTouched();
  }
}
