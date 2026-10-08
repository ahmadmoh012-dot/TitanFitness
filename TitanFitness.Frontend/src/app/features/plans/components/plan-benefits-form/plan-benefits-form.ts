import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AccessScope, accessScopeLabel } from '../../../../core/models/plans/access-scope.model';
import { PlanBenefits } from '../../../../core/models/plans/plan-benefits.model';
import { FieldLabel } from '../../../../shared/components/field-label/field-label';
import { FieldMessage } from '../../../../shared/components/field-message/field-message';
import { TextField } from '../../../../shared/components/text-field/text-field';

type TermsEditorControl = Exclude<keyof PlanBenefits<number>, 'accessScope'>;

@Component({
  selector: 'app-plan-benefits-form',
  standalone: true,
  imports: [FieldMessage, FieldLabel, ReactiveFormsModule, TextField],
  templateUrl: './plan-benefits-form.html'
})
export class PlanBenefitsForm {
  form = input.required<FormGroup>();
  viewMode = input(false);

  readonly AccessScope = AccessScope;

  readonly fields: {
    control: TermsEditorControl;
    label: string;
    placeholder: string;
    errorMessage: string;
  }[] = [
      {
        control: 'maxFreezeDays',
        label: 'Maximum freeze days',
        placeholder: '0',
        errorMessage: 'Maximum freeze days cannot be negative.'
      },
      {
        control: 'maxFreezes',
        label: 'Maximum number of freezes',
        placeholder: '0',
        errorMessage: 'Maximum number of freezes cannot be negative.'
      },
      {
        control: 'guestPassQuota',
        label: 'Guest pass quota',
        placeholder: '0',
        errorMessage: 'Guest pass quota cannot be negative.'
      }
    ];

  ctrl(key: TermsEditorControl): FormControl<number | null> {
    return this.form().get(key) as FormControl<number | null>;
  }

  accessScopeControl(): FormControl<number | null> {
    return this.form().get('accessScope') as FormControl<number | null>;
  }

  accessScopeCaption(): string {
    const value = this.accessScopeControl().value;

    if (value === null || value === undefined)
      return '';

    return accessScopeLabel(value);
  }
}
