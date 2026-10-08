export interface UpcomingSession {
  sessionId: number;
  className: string;
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  studioName: string;
  trainerName: string;
  bookedCount: number;
  capacityLimit: number;
  status: string;
}
