export interface BookingCreateRequest {
  sessionId: number;
  memberId: number;
  trainerNotes: string | null;
}

export interface BookingReceipt {
  bookingId: number;
  status: number;
  waitlistPosition: number | null;
}
