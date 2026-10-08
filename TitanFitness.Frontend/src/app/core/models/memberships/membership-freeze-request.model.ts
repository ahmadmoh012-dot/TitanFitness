export interface MembershipFreezeRequest {
  startDate: string;
  freezeDurationId: number;
  freezeReasonId: number;
  notes: string | null;
}
