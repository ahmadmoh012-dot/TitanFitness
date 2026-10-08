export interface SessionCreateRequest {
  className: string;
  branchId: number;
  studioId: number;
  trainerId: number;
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  capacityLimit: number;
  description: string | null;
}
