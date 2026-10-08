import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { catchError, finalize, of } from 'rxjs';
import { AccessScope } from '../../../../core/models/plans/access-scope.model';
import { PlanCatalogueRecord } from '../../../../core/models/plans/plan-catalog-record.model';
import { PlanApiService } from '../../../../core/services/plan-api.service';
import { Button } from '../../../../shared/components/button/button';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { PageHeading } from '../../../../shared/components/page-heading/page-heading';
import { PlanAction, PlanCatalogueTable } from '../../components/plan-catalogue-table/plan-catalogue-table';

@Component({
  selector: 'app-plan-catalogue',
  standalone: true,
  imports: [FontAwesomeModule, FeedbackBanner, Button, PageHeading, LoadingState, PlanCatalogueTable],
  templateUrl: './plan-catalogue.html'
})
export class PlanCatalogue implements OnInit {
  private readonly plansApi = inject(PlanApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  tiers = signal<PlanCatalogueRecord[]>([]);

  accessScope = signal<AccessScope | null>(null);
  lookup = signal('');
  page = signal(1);
  pageSize = signal(4);
  totalPages = signal(0);
  totalCount = signal(0);

  fetching = signal(true);
  failure = signal('');

  readonly plusGlyph = faPlus;
  readonly AccessScope = AccessScope;

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(queryMap => {
        const scope = Number(queryMap.get('accessScope'));

        this.accessScope.set(
          scope === AccessScope.HomeBranchOnly ||
            scope === AccessScope.AllBranches
            ? scope
            : null
        );

        this.lookup.set(queryMap.get('search') ?? '');

        this.page.set(Number(queryMap.get('page')) || 1);

        this.fetchTiers();
      });
  }

  handleAccessScopeChange(evt: Event): void {
    const incoming = (evt.target as HTMLSelectElement).value;

    this.router.navigate(['/plans'], {
      queryParams: { accessScope: incoming || null, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  handlePageChange(page: number): void {
    this.router.navigate(['/plans'], { queryParams: { page }, queryParamsHandling: 'merge' });
  }

  startNewTier(): void {
    this.router.navigate(['/plans/details'], { queryParams: { mode: 'create' } });
  }

  handleTierCommand(evt: {
    action: PlanAction;
    planId: number;
  }): void {
    if (evt.action === 'viewPlan') {
      this.router.navigate(['/plans/details'], { queryParams: { mode: 'view', planId: evt.planId } });
      return;
    }

    this.router.navigate(['/plans/details'], { queryParams: { mode: 'edit', planId: evt.planId } });
  }

  private fetchTiers(): void {
    this.fetching.set(true);
    this.failure.set('');
    this.tiers.set([]);
    this.totalPages.set(0);
    this.totalCount.set(0);

    this.plansApi.getPlans(this.accessScope(), this.lookup(), this.page())
      .pipe(
        catchError(failure => {
          this.failure.set(failure.message);

          return of({ items: [], totalCount: 0, pageNumber: this.page(), pageSize: 4, totalPages: 0 });
        }),
        finalize(() =>
          this.fetching.set(false)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(reply => {
        this.tiers.set(reply.items);

        this.pageSize.set(reply.pageSize);

        this.totalCount.set(reply.totalCount);

        this.totalPages.set(reply.totalPages);
      });
  }
}
