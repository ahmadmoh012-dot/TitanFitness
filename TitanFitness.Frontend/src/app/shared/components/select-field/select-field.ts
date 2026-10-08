import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldLabel } from '../field-label/field-label';
import { FieldMessage } from '../field-message/field-message';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [ReactiveFormsModule, FieldLabel, FieldMessage],
  templateUrl: './select-field.html'
})
export class SelectField {
  label = input.required<string>();
  control = input.required<FormControl<number | null>>();
  options = input.required<{ value: number; label: string }[]>();
  placeholder = input('Select option');
  helper = input('');
  requiredMark = input(false);
  errorMessage = input('');
}
