export interface PlanDetailsRecord {
  planId: number;
  planName: string;
  price: number;
  durationInMonths: number;
  maxFreezeDays: number;
  maxFreezes: number;
  guestPassQuota: number;
  accessScope: number;
  isPublished: boolean;
  activeMembershipsCount: number;
}
