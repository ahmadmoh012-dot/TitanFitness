import { PlanSwitchMode } from './plan-switch-mode.model';

export interface PlanSwitchRequest {
  newPlanId: number;
  effectiveMode: PlanSwitchMode;
}
