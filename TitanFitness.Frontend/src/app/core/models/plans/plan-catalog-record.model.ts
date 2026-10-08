export interface PlanCatalogueRecord {
  planId: number;
  planName: string;
  price: number;
  durationInMonths: number;
  isPublished: boolean;
  maxFreezeDays: number;
  maxFreezes: number;
  guestPassQuota: number;
  accessScope: string;
}
