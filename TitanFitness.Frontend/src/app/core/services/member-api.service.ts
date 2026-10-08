import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URL } from '../config/api-endpoint.config';
import { CreatedResource } from '../models/common/created-resource.model';
import { PagedResult } from '../models/common/paged-result.model';
import { CurrentMembership } from '../models/members/current-membership.model';
import { EntryDecision } from '../models/members/entry-decision.model';
import { MemberActivityRecord } from '../models/members/member-activity-record.model';
import { MemberCreateRequest } from '../models/members/member-create-request.model';
import { MemberDirectoryRecord } from '../models/members/member-directory-record.model';
import { MemberProfileRecord } from '../models/members/member-profile-record.model';
import { MemberUpdateRequest } from '../models/members/member-update-request.model';

interface MemberListResponse { items: MemberListItemResponse[]; page: number; totalCount: number; }
interface MemberListItemResponse {
  id: number; membershipNumber: string; fullName: string; email: string | null; phone: string | null;
  homeBranchId: number; branchName: string; status: string; lastVisit: string | null;
}
interface MemberDetailsResponse {
  id: number; membershipNumber: string; fullName: string; email: string | null; phone: string | null;
  address: string | null; joinedDate: string; photo: string | null; homeBranchId: number;
}
interface CurrentMembershipResponse {
  id: number; planId: number; purchaseDate: string; startDate: string; endDate: string;
  status: number; pricePaid: number; durationInMonths: number; maximumFreezeDays: number;
  maximumNumberOfFreezes: number; guestPassQuota: number; accessScope: number;
}
interface EntryEligibilityResponse { result: number; refusalReason: number | null; }
interface MemberActivityResponse { type: string; occurredAt: string; description: string; }
interface MemberProfileResponse {
  currentMembership: { membershipId: number; planId: number; planName: string; pricePaid: number; startDate: string; endDate: string; status: string; } | null;
  freezesUsed: number; maximumFreezes: number; guestPassesUsed: number; guestPassQuota: number;
}

const MEMBER_PAGE_SIZE = 4;
const membershipStatus = (value: number): string => ['Unknown','Pending','Active','Frozen','Expired','Cancelled'][value] ?? 'Unknown';
const refusalReason = (value: number | null): string | null => value == null ? null : ({1:'Expired',2:'Frozen',3:'Cancelled',4:'Not yet started',5:'Wrong branch'} as Record<number,string>)[value] ?? 'Entry refused';

@Injectable({ providedIn: 'root' })
export class MemberApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_URL}/members`;

  getMembers(branchId: number | null, search: string, page: number): Observable<PagedResult<MemberDirectoryRecord>> {
    let params = new HttpParams().set('page', page);
    if (branchId !== null) params = params.set('branchId', branchId);
    if (search.trim()) params = params.set('query', search.trim());

    return this.http.get<MemberListResponse>(this.endpoint, { params }).pipe(
      map(response => ({
        items: response.items.map(item => ({
          memberId: item.id,
          membershipNumber: item.membershipNumber,
          fullName: item.fullName,
          status: item.status,
          branch: item.branchName,
          lastVisit: item.lastVisit,
          photo: null
        })),
        pageNumber: response.page,
        pageSize: MEMBER_PAGE_SIZE,
        totalCount: response.totalCount,
        totalPages: Math.ceil(response.totalCount / MEMBER_PAGE_SIZE)
      }))
    );
  }

  getMemberById(memberId: number): Observable<MemberProfileRecord> {
    return this.http.get<MemberDetailsResponse>(`${this.endpoint}/${memberId}`).pipe(
      map(member => ({
        memberId: member.id,
        membershipNumber: member.membershipNumber,
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
        address: member.address,
        joinedDate: member.joinedDate,
        photo: member.photo,
        homeBranchId: member.homeBranchId
      }))
    );
  }

  getCurrentMembership(memberId: number): Observable<CurrentMembership> {
    return this.http.get<MemberProfileResponse>(`${this.endpoint}/${memberId}/profile`).pipe(
      map(profile => {
        if (!profile.currentMembership) throw new Error('No current membership was found.');
        const current = profile.currentMembership;
        return {
          membershipId: current.membershipId,
          planId: current.planId,
          planName: current.planName,
          pricePaid: current.pricePaid,
          startDate: current.startDate,
          endDate: current.endDate,
          status: current.status,
          freezesUsed: profile.freezesUsed,
          freezesAllowed: profile.maximumFreezes,
          guestPassesUsed: profile.guestPassesUsed,
          guestPassesAllowed: profile.guestPassQuota
        };
      })
    );
  }

  getActiveMembershipRecord(memberId: number): Observable<CurrentMembershipResponse> {
    return this.http.get<CurrentMembershipResponse>(`${this.endpoint}/${memberId}/active-membership`);
  }

  getMemberActivity(memberId: number): Observable<MemberActivityRecord[]> {
    const params = new HttpParams().set('take', 7);
    return this.http.get<MemberActivityResponse[]>(`${this.endpoint}/${memberId}/recent-activity`, { params }).pipe(
      map(items => items.map(item => ({
        activityType: item.type,
        description: item.description,
        dateTime: item.occurredAt,
        result: null,
        refusalReason: null
      })))
    );
  }

  getEntryEligibility(memberId: number, branchId: number): Observable<EntryDecision> {
    const params = new HttpParams().set('branchId', branchId);
    return this.http.get<EntryEligibilityResponse>(`${this.endpoint}/${memberId}/eligibility`, { params }).pipe(
      map(value => ({ isAdmitted: value.result === 1, refusalReason: refusalReason(value.refusalReason) }))
    );
  }

  createMember(member: MemberCreateRequest): Observable<number> {
    return this.http.post<CreatedResource>(this.endpoint, member).pipe(map(result => result.id));
  }

  updateMember(memberId: number, member: MemberUpdateRequest): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/${memberId}`, member);
  }
}
