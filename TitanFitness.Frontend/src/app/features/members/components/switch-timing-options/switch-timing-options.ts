import { Component, input, output } from '@angular/core';
import { PlanSwitchMode } from '../../../../core/models/memberships/plan-switch-mode.model';
import { FieldLabel } from '../../../../shared/components/field-label/field-label';

@Component({
  selector: 'app-switch-timing-options',
  standalone: true,
  imports: [
    FieldLabel,],
  templateUrl: './switch-timing-options.html'
})
export class SwitchTimingOptions {
  mode = input.required<PlanSwitchMode>();
  startDate = input.required<string>();
  modeChange = output<PlanSwitchMode>();

  readonly effectiveMode = PlanSwitchMode;
}
