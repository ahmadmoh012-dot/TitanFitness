import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PlanCoreFields } from '../../../../core/models/plans/plan-core-fields.model';
import { FieldLabel } from '../../../../shared/components/field-label/field-label';
import { FieldMessage } from '../../../../shared/components/field-message/field-message';
import { TextField } from '../../../../shared/components/text-field/text-field';

type MainEditorControl = Exclude<
  keyof PlanCoreFields,
  'isPublished'
>;

type MainFormControl =
  FormControl<string | null> |
  FormControl<number | null>;

@Component({
  selector: 'app-plan-core-form',
  standalone: true,
  imports: [FieldMessage, FieldLabel, ReactiveFormsModule, TextField],
  templateUrl: './plan-core-form.html'
})
export class PlanCoreForm {
  form = input.required<FormGroup>();
  viewMode = input(false);

  readonly fields: {
    control: MainEditorControl;
    label: string;
    type: 'text' | 'number';
    placeholder: string;
    requiredMark: boolean;
    errorMessage: string;
    min: number | null;
    step: number | string | null;
  }[] = [
      {
        control: 'planName',
        label: 'Plan name',
        type: 'text',
        placeholder: 'e.g., Annual Pro',
        requiredMark: true,
        errorMessage: 'Plan name is required and cannot exceed 50 characters.',
        min: null,
        step: null
      },
      {
        control: 'price',
        label: 'Price',
        type: 'number',
        placeholder: '0.00',
        requiredMark: true,
        errorMessage: 'Price must be zero or greater.',
        min: 0,
        step: '0.01'
      },
      {
        control: 'durationInMonths',
        label: 'Duration in months',
        type: 'number',
        placeholder: 'e.g., 12',
        requiredMark: true,
        errorMessage: 'Duration must be greater than zero.',
        min: 1,
        step: 1
      }
    ];

  ctrl(key: MainEditorControl): MainFormControl {
    return this.form().get(key) as MainFormControl;
  }

  publishedControl(): FormControl<boolean> {
    return this.form().get('isPublished') as FormControl<boolean>;
  }
}
