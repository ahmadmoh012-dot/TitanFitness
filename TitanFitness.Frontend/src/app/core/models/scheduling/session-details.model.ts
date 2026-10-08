export interface SessionDetails {
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
  studioId: number;
  trainerId: number;
  remainingPlaces: number;
  description: string | null;
}
