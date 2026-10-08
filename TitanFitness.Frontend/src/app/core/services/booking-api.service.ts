import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api-endpoint.config';
import { BookingCreateRequest, BookingReceipt } from '../models/bookings/booking-create-request.model';

@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_URL}/bookings`;

  createBooking(booking: BookingCreateRequest): Observable<BookingReceipt> {
    return this.http.post<BookingReceipt>(this.endpoint, {
      sessionId: booking.sessionId,
      memberId: booking.memberId,
      notesForTrainer: booking.trainerNotes
    });
  }
}
