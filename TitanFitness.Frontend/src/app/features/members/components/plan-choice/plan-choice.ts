import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AvailablePlan } from '../../../../core/models/memberships/available-plan.model';
import { FieldLabel } from '../../../../shared/components/field-label/field-label';

@Component({
  selector: 'app-plan-choice',
  standalone: true,
  imports: [
    FieldLabel,DecimalPipe],
  templateUrl: './plan-choice.html'
})
export class PlanChoice {
  plans = input.required<AvailablePlan[]>();
  selectedPlanId = input<number | null>(null);
  selectedPlanIdChange = output<number | null>();

  propagateChange(evt: Event): void {
    const incoming = (evt.target as HTMLSelectElement).value;

    this.selectedPlanIdChange.emit(incoming ? Number(incoming) : null);
  }
}
