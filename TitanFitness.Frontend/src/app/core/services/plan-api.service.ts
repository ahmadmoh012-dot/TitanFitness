import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { API_URL } from '../config/api-endpoint.config';
import { CreatedResource } from '../models/common/created-resource.model';
import { PagedResult } from '../models/common/paged-result.model';
import { AccessScope, accessScopeLabel } from '../models/plans/access-scope.model';
import { PlanCatalogueRecord } from '../models/plans/plan-catalog-record.model';
import { PlanDetailsRecord } from '../models/plans/plan-details.model';
import { PlanSaveRequest } from '../models/plans/plan-save-request.model';

interface PlanItemResponse {
  id: number;
  name: string;
  price: number;
  durationInMonths: number;
  maximumFreezeDays: number;
  maximumNumberOfFreezes: number;
  guestPassQuota: number;
  accessScope: number;
  isPublished: boolean;
}

interface PlanListResponse {
  items: PlanItemResponse[];
  page: number;
  totalCount: number;
}

interface PlanDetailsResponse extends PlanItemResponse {
  soldMembershipCount: number;
}

type CatalogueItem = PlanCatalogueRecord & {
  accessScopeRaw: number;
};

const PLAN_PAGE_SIZE = 4;

@Injectable({ providedIn: 'root' })
export class PlanApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_URL}/plans`;

  getPlans(
    accessScope: AccessScope | null,
    search: string,
    page: number,
    isPublished?: boolean
  ): Observable<PagedResult<PlanCatalogueRecord>> {
    const query = search.trim();

    let firstParams = new HttpParams()
      .set('page', 1);

    if (query)
      firstParams = firstParams.set('query', query);

    if (isPublished !== undefined)
      firstParams = firstParams.set('isPublished', isPublished);

    return this.http
      .get<PlanListResponse>(
        this.endpoint,
        { params: firstParams }
      )
      .pipe(
        switchMap(firstPage => {
          const pageCount = Math.ceil(
            firstPage.totalCount / PLAN_PAGE_SIZE
          );

          if (pageCount <= 1)
            return of(firstPage.items);

          const requests = Array.from(
            { length: pageCount - 1 },
            (_, index) => index + 2
          ).map(pageNumber => {
            let params = new HttpParams()
              .set('page', pageNumber);

            if (query)
              params = params.set('query', query);

            if (isPublished !== undefined)
              params = params.set(
                'isPublished',
                isPublished
              );

            return this.http.get<PlanListResponse>(
              this.endpoint,
              { params }
            );
          });

          return forkJoin(requests).pipe(
            map(responses => [
              ...firstPage.items,
              ...responses.flatMap(
                response => response.items
              )
            ])
          );
        }),

        map(items => {
          const mapped = items.map(item =>
            this.toCatalogue(item)
          );

          const filtered =
            accessScope === null
              ? mapped
              : mapped.filter(item =>
                item.accessScopeRaw === accessScope
              );

          const totalCount = filtered.length;

          const totalPages = Math.ceil(
            totalCount / PLAN_PAGE_SIZE
          );

          const safePage =
            totalPages === 0
              ? 1
              : Math.min(
                Math.max(page, 1),
                totalPages
              );

          const startIndex =
            (safePage - 1) *
            PLAN_PAGE_SIZE;

          const pagedItems = filtered.slice(
            startIndex,
            startIndex + PLAN_PAGE_SIZE
          );

          return {
            items: pagedItems,
            pageNumber: safePage,
            pageSize: PLAN_PAGE_SIZE,
            totalCount,
            totalPages
          };
        })
      );
  }

  getPlanById(
    planId: number
  ): Observable<PlanDetailsRecord> {
    return this.http
      .get<PlanDetailsResponse>(
        `${this.endpoint}/${planId}`
      )
      .pipe(
        map(item => ({
          planId: item.id,
          planName: item.name,
          price: item.price,
          durationInMonths:
            item.durationInMonths,
          maxFreezeDays:
            item.maximumFreezeDays,
          maxFreezes:
            item.maximumNumberOfFreezes,
          guestPassQuota:
            item.guestPassQuota,
          accessScope:
            Number(item.accessScope),
          isPublished:
            item.isPublished,
          activeMembershipsCount:
            item.soldMembershipCount
        }))
      );
  }

  getPublishedPlans(): Observable<PlanCatalogueRecord[]> {
    const firstParams = new HttpParams()
      .set('page', 1)
      .set('isPublished', true);

    return this.http
      .get<PlanListResponse>(
        this.endpoint,
        { params: firstParams }
      )
      .pipe(
        switchMap(firstPage => {
          const pageCount = Math.ceil(
            firstPage.totalCount /
            PLAN_PAGE_SIZE
          );

          if (pageCount <= 1) {
            return of(
              firstPage.items.map(item =>
                this.toCatalogue(item)
              )
            );
          }

          const requests = Array.from(
            { length: pageCount - 1 },
            (_, index) => index + 2
          ).map(pageNumber => {
            const params = new HttpParams()
              .set('page', pageNumber)
              .set('isPublished', true);

            return this.http.get<PlanListResponse>(
              this.endpoint,
              { params }
            );
          });

          return forkJoin(requests).pipe(
            map(responses => [
              ...firstPage.items,
              ...responses.flatMap(
                response => response.items
              )
            ].map(item =>
              this.toCatalogue(item)
            ))
          );
        })
      );
  }

  createPlan(
    plan: PlanSaveRequest
  ): Observable<number> {
    return this.http
      .post<CreatedResource>(
        this.endpoint,
        this.toRequest(plan)
      )
      .pipe(
        map(result => result.id)
      );
  }

  updatePlan(
    planId: number,
    plan: PlanSaveRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.endpoint}/${planId}`,
      this.toRequest(plan)
    );
  }

  private toCatalogue(
    item: PlanItemResponse
  ): CatalogueItem {
    return {
      planId: item.id,
      planName: item.name,
      price: item.price,
      durationInMonths:
        item.durationInMonths,
      maxFreezeDays:
        item.maximumFreezeDays,
      maxFreezes:
        item.maximumNumberOfFreezes,
      guestPassQuota:
        item.guestPassQuota,
      accessScope:
        accessScopeLabel(
          item.accessScope
        ),
      accessScopeRaw:
        Number(item.accessScope),
      isPublished:
        item.isPublished
    };
  }

  private toRequest(
    plan: PlanSaveRequest
  ) {
    return {
      name: plan.planName,
      price: plan.price,
      durationInMonths:
        plan.durationInMonths,
      maximumFreezeDays:
        plan.maxFreezeDays,
      maximumNumberOfFreezes:
        plan.maxFreezes,
      guestPassQuota:
        plan.guestPassQuota,
      accessScope:
        Number(plan.accessScope),
      isPublished:
        plan.isPublished
    };
  }
}
