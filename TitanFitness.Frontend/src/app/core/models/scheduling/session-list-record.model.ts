export interface SessionListRecord {
  sessionId: number;
  className: string;
  branchId: number;
  branchName: string;
  studioName: string;
  trainerName: string;
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  capacityLimit: number;
  bookedCount: number;
  waitlistCount: number;
  status: string;
}
