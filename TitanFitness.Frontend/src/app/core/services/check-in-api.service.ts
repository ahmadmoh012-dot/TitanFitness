import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URL } from '../config/api-endpoint.config';
import { CheckInRequest } from '../models/check-ins/check-in-request.model';
import { CheckInResultRecord } from '../models/check-ins/check-in-result.model';

interface CheckInResponse { checkInId: number; result: number; refusalReason: number | null; }
const refusalReason = (value: number | null): string | null => value == null ? null : ({1:'Expired',2:'Frozen',3:'Cancelled',4:'Not yet started',5:'Wrong branch'} as Record<number,string>)[value] ?? 'Entry refused';

@Injectable({ providedIn: 'root' })
export class CheckInApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_URL}/check-ins`;

  createCheckIn(checkIn: CheckInRequest): Observable<CheckInResultRecord> {
    return this.http.post<CheckInResponse>(this.endpoint, checkIn).pipe(
      map(result => ({ checkInId: result.checkInId, result: result.result, refusalReason: refusalReason(result.refusalReason) }))
    );
  }
}
