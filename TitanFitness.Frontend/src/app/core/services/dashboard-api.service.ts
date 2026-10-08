import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URL } from '../config/api-endpoint.config';
import { CheckInSummary } from '../models/dashboard/check-in-summary.model';
import { MemberActivitySummary } from '../models/dashboard/member-activity-summary.model';
import { UpcomingSession } from '../models/dashboard/upcoming-session.model';

interface CheckInsTodayResponse { count: number; percentageVsLastWeek: number; }
interface ActiveMembersResponse { count: number; currentlyInside: number; }
interface UpcomingClassResponse {
  id: number; className: string; studioName: string; trainerName: string;
  sessionDate: string; startTime: string; durationInMinutes: number;
  capacityLimit: number; confirmedBookings: number; status: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_URL}/dashboard`;

  loadTodayCheckIns(): Observable<CheckInSummary> {
    return this.http.get<CheckInsTodayResponse>(`${this.endpoint}/todays-checkins`).pipe(
      map(value => ({ checkInsToday: value.count, percentageChange: value.percentageVsLastWeek }))
    );
  }

  loadMemberSummary(): Observable<MemberActivitySummary> {
    return this.http.get<ActiveMembersResponse>(`${this.endpoint}/current-members`).pipe(
      map(value => ({ activeMembers: value.count, currentlyInside: value.currentlyInside }))
    );
  }

  loadUpcomingSessions(take = 2): Observable<UpcomingSession[]> {
    const params = new HttpParams().set('take', take);
    return this.http.get<UpcomingClassResponse[]>(`${this.endpoint}/next-classes`, { params }).pipe(
      map(items => items.map(item => ({
        sessionId: item.id,
        className: item.className,
        sessionDate: item.sessionDate,
        startTime: item.startTime,
        durationMinutes: item.durationInMinutes,
        studioName: item.studioName,
        trainerName: item.trainerName,
        bookedCount: item.confirmedBookings,
        capacityLimit: item.capacityLimit,
        status: item.status
      })))
    );
  }

  getCheckInsToday() { return this.loadTodayCheckIns(); }
  getActiveMembers() { return this.loadMemberSummary(); }
  getUpcomingClasses() { return this.loadUpcomingSessions(); }
}
