import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { API_URL } from '../config/api-endpoint.config';
import { CreatedResource } from '../models/common/created-resource.model';
import { AvailablePlan } from '../models/memberships/available-plan.model';
import { MembershipDetailsRecord } from '../models/memberships/membership-details.model';
import { MembershipFreezeRequest } from '../models/memberships/membership-freeze-request.model';
import { PlanSwitchMode } from '../models/memberships/plan-switch-mode.model';
import { PlanSwitchRequest } from '../models/memberships/plan-switch-request.model';
import { accessScopeLabel } from '../models/plans/access-scope.model';
import { PlanApiService } from './plan-api.service';

interface MembershipResponse {
  id: number; memberId: number; planId: number; purchaseDate: string; startDate: string; endDate: string;
  status: number; pricePaid: number; durationInMonths: number; maximumFreezeDays: number;
  maximumNumberOfFreezes: number; guestPassQuota: number; accessScope: number;
}
const statusLabel = (value: number) => ['Unknown','Pending','Active','Frozen','Expired','Cancelled'][value] ?? 'Unknown';

@Injectable({ providedIn: 'root' })
export class MembershipApiService {
  private readonly http = inject(HttpClient);
  private readonly plans = inject(PlanApiService);
  private readonly endpoint = `${API_URL}/memberships`;

  getMembershipById(membershipId: number): Observable<MembershipDetailsRecord> {
    return this.http.get<MembershipResponse>(`${this.endpoint}/${membershipId}`).pipe(
      switchMap(membership => this.plans.getPlanById(membership.planId).pipe(
        map(plan => ({
          membershipId: membership.id,
          memberId: membership.memberId,
          planId: membership.planId,
          planName: plan.planName,
          purchaseDate: membership.purchaseDate,
          startDate: membership.startDate,
          endDate: membership.endDate,
          status: statusLabel(membership.status),
          pricePaid: membership.pricePaid,
          durationInMonths: membership.durationInMonths,
          maximumFreezeDays: membership.maximumFreezeDays,
          maximumNumberOfFreezes: membership.maximumNumberOfFreezes,
          guestPassQuota: membership.guestPassQuota,
          accessScope: accessScopeLabel(membership.accessScope)
        }))
      ))
    );
  }

  getAvailablePlans(_membershipId: number): Observable<AvailablePlan[]> {
    return this.plans.getPublishedPlans().pipe(
      map(items => items.map(plan => ({
        planId: plan.planId,
        planName: plan.planName,
        price: plan.price,
        durationInMonths: plan.durationInMonths
      })))
    );
  }

  renewMembership(membershipId: number): Observable<number> {
    return this.http.post<CreatedResource>(`${this.endpoint}/${membershipId}/renewal`, {}).pipe(map(result => result.id));
  }

  changePlan(membershipId: number, request: PlanSwitchRequest): Observable<number> {
    return this.http.post<CreatedResource>(`${this.endpoint}/${membershipId}/switch-plan`, {
      newPlanId: request.newPlanId,
      applyImmediately: request.effectiveMode === PlanSwitchMode.Immediately
    }).pipe(map(result => result.id));
  }

  addFreeze(membershipId: number, freeze: MembershipFreezeRequest): Observable<void> {
    return this.http.post<void>(`${this.endpoint}/${membershipId}/freeze`, {
      startDate: freeze.startDate,
      durationInMonths: freeze.freezeDurationId,
      reason: freeze.freezeReasonId,
      additionalNotes: freeze.notes
    });
  }
}
