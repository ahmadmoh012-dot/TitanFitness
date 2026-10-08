import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldLabel } from '../field-label/field-label';
import { FieldMessage } from '../field-message/field-message';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [ReactiveFormsModule, FieldLabel, FieldMessage],
  templateUrl: './text-field.html'
})
export class TextField {
  label = input.required<string>();

  control = input.required<
    FormControl<string | null> |
    FormControl<number | null>
  >();

  type = input<'text' | 'email' | 'tel' | 'date' | 'number'>('text');

  placeholder = input('');
  helper = input('');
  requiredMark = input(false);
  readonly = input(false);
  errorMessage = input('');

  min = input<number | null>(null);
  step = input<number | string | null>(null);
}
