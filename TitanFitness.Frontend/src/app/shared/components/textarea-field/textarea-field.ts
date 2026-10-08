import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldLabel } from '../field-label/field-label';
import { FieldMessage } from '../field-message/field-message';

@Component({
  selector: 'app-textarea-field',
  standalone: true,
  imports: [ReactiveFormsModule, FieldLabel, FieldMessage],
  templateUrl: './textarea-field.html'
})
export class TextareaField {
  id = input.required<string>();
  label = input.required<string>();
  control = input.required<FormControl<string | null>>();
  placeholder = input('');
  rows = input(3);
  optionalText = input('');
  requiredMark = input(false);
  maxLength = input<number | null>(null);
  errorMessage = input('');
}
