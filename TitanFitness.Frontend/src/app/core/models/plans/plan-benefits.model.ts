export interface PlanBenefits<TAccessScope = number> {
  maxFreezeDays: number;
  maxFreezes: number;
  guestPassQuota: number;
  accessScope: TAccessScope;
}
