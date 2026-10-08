export interface PlanSaveRequest {
  planName: string;
  price: number;
  durationInMonths: number;
  isPublished: boolean;
  maxFreezeDays: number;
  maxFreezes: number;
  guestPassQuota: number;
  accessScope: number;
}
