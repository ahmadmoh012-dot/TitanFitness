import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { API_URL } from '../config/api-endpoint.config';
import { CreatedResource } from '../models/common/created-resource.model';
import { PagedResult } from '../models/common/paged-result.model';
import { DayCapacitySummary } from '../models/scheduling/day-capacity-summary.model';
import { SessionCreateRequest } from '../models/scheduling/session-create-request.model';
import { SessionDetails } from '../models/scheduling/session-details.model';
import { SessionListRecord } from '../models/scheduling/session-list-record.model';

interface SessionResponse {
  id: number; className: string; branchId: number; branchName: string; studioId: number; studioName: string;
  trainerId: number; trainerName: string; sessionDate: string; startTime: string; durationInMinutes: number;
  capacityLimit: number; confirmedBookings: number; waitlistCount: number; status: string;
}
interface SessionListResponse { items: SessionResponse[]; page: number; totalCount: number; }
interface SessionDetailsResponse {
  id: number; className: string; branchId: number; studioId: number; trainerId: number; sessionDate: string;
  startTime: string; durationInMinutes: number; capacityLimit: number; status: number; description: string | null;
}
interface DaySummaryResponse { totalBookings: number; averageCapacityFilledPercentage: number; }
const SESSION_PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class SessionApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_URL}/class-sessions`;

  getClassSessions(branchId: number | null, date: string, page: number): Observable<PagedResult<SessionListRecord>> {
    let params = new HttpParams().set('date', date).set('page', page);
    if (branchId !== null) params = params.set('branchId', branchId);
    return this.http.get<SessionListResponse>(this.endpoint, { params }).pipe(map(response => ({
      items: response.items.map(item => this.toListRecord(item)),
      pageNumber: response.page,
      pageSize: SESSION_PAGE_SIZE,
      totalCount: response.totalCount,
      totalPages: Math.ceil(response.totalCount / SESSION_PAGE_SIZE)
    })));
  }

  getDaySummary(branchId: number | null, date: string): Observable<DayCapacitySummary> {
    let params = new HttpParams().set('date', date);
    if (branchId !== null) params = params.set('branchId', branchId);
    return this.http.get<DaySummaryResponse>(`${this.endpoint}/daily-summary`, { params }).pipe(
      map(value => ({ totalBookings: value.totalBookings, averageFillRate: value.averageCapacityFilledPercentage }))
    );
  }

  createClassSession(session: SessionCreateRequest): Observable<number> {
    return this.http.post<CreatedResource>(this.endpoint, {
      className: session.className,
      branchId: session.branchId,
      studioId: session.studioId,
      trainerId: session.trainerId,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      durationInMinutes: session.durationMinutes,
      capacityLimit: session.capacityLimit,
      description: session.description
    }).pipe(map(result => result.id));
  }

  getClassSessionById(sessionId: number): Observable<SessionDetails> {
    return this.http.get<SessionDetailsResponse>(`${this.endpoint}/${sessionId}`).pipe(
      switchMap(details => this.getClassSessions(details.branchId, details.sessionDate, 1).pipe(
        map(page => {
          const list = page.items.find(item => item.sessionId === sessionId);
          return {
            sessionId: details.id,
            className: details.className,
            branchId: details.branchId,
            branchName: list?.branchName ?? '',
            studioId: details.studioId,
            studioName: list?.studioName ?? '',
            trainerId: details.trainerId,
            trainerName: list?.trainerName ?? '',
            sessionDate: details.sessionDate,
            startTime: details.startTime,
            durationMinutes: details.durationInMinutes,
            capacityLimit: details.capacityLimit,
            bookedCount: list?.bookedCount ?? 0,
            waitlistCount: list?.waitlistCount ?? 0,
            remainingPlaces: Math.max(0, details.capacityLimit - (list?.bookedCount ?? 0)),
            status: list?.status ?? String(details.status),
            description: details.description
          };
        })
      ))
    );
  }

  private toListRecord(item: SessionResponse): SessionListRecord {
    return {
      sessionId: item.id,
      className: item.className,
      branchId: item.branchId,
      branchName: item.branchName,
      studioName: item.studioName,
      trainerName: item.trainerName,
      sessionDate: item.sessionDate,
      startTime: item.startTime,
      durationMinutes: item.durationInMinutes,
      capacityLimit: item.capacityLimit,
      bookedCount: item.confirmedBookings,
      waitlistCount: item.waitlistCount,
      status: item.status
    };
  }
}
