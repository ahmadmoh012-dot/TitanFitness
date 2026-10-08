import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { catchError, finalize, of } from 'rxjs';
import { BranchOption } from '../../../../core/models/branches/branch-option.model';
import { TrainerDirectoryRecord } from '../../../../core/models/trainers/trainer-directory-record.model';
import { BranchApiService } from '../../../../core/services/branch-api.service';
import { TrainerApiService } from '../../../../core/services/trainer-api.service';
import { BranchFilter } from '../../../../shared/components/branch-filter/branch-filter';
import { Button } from '../../../../shared/components/button/button';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { PageHeading } from '../../../../shared/components/page-heading/page-heading';
import { TrainerAction, TrainerDirectoryTable } from '../../components/trainer-directory-table/trainer-directory-table';

@Component({
  selector: 'app-trainer-directory',
  standalone: true,
  imports: [
    FontAwesomeModule,
    FeedbackBanner,
    BranchFilter,
    Button,
    PageHeading,
    LoadingState,
    TrainerDirectoryTable
  ],
  templateUrl: './trainer-directory.html'
})
export class TrainerDirectory implements OnInit {
  private readonly trainersApi = inject(TrainerApiService);
  private readonly branchesApi = inject(BranchApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  coaches = signal<TrainerDirectoryRecord[]>([]);
  sites = signal<BranchOption[]>([]);

  siteId = signal<number | null>(null);
  lookup = signal('');
  page = signal(1);
  pageSize = signal(4);
  totalPages = signal(0);
  totalCount = signal(0);

  private readonly sitesFetching = signal(true);
  private readonly coachesFetching = signal(true);

  fetching = computed(() =>
    this.sitesFetching() ||
    this.coachesFetching()
  );

  siteFailure = signal('');
  coachFailure = signal('');

  failure = computed(() =>
    this.siteFailure() ||
    this.coachFailure()
  );

  readonly plusGlyph = faPlus;

  ngOnInit(): void {
    this.fetchSites();

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(queryMap => {
        const siteId = queryMap.get('branchId');

        this.siteId.set(siteId ? Number(siteId) : null);

        this.lookup.set(queryMap.get('search') ?? '');

        this.page.set(Number(queryMap.get('page')) || 1);

        this.fetchCoaches();
      });
  }

  handleSiteChange(siteId: number | null): void {
    this.router.navigate(['/trainers'], {
      queryParams: { branchId: siteId, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  handlePageChange(page: number): void {
    this.router.navigate(['/trainers'], { queryParams: { page }, queryParamsHandling: 'merge' });
  }

  startNewCoach(): void {
    this.router.navigate(['/trainers/details'], { queryParams: { mode: 'create' } });
  }

  handleCoachCommand(evt: {
    action: TrainerAction;
    trainerId: number;
  }): void {
    if (evt.action === 'viewTrainer') {
      this.router.navigate(['/trainers/details'], {
        queryParams: { mode: 'view', trainerId: evt.trainerId }
      });
      return;
    }

    this.router.navigate(['/trainers/details'], { queryParams: { mode: 'edit', trainerId: evt.trainerId } });
  }

  private fetchSites(): void {
    this.sitesFetching.set(true);
    this.siteFailure.set('');

    this.branchesApi.getBranches()
      .pipe(
        catchError(failure => {
          this.siteFailure.set(failure.message);

          return of([]);
        }),
        finalize(() =>
          this.sitesFetching.set(false)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(reply =>
        this.sites.set(reply)
      );
  }

  private fetchCoaches(): void {
    this.coachesFetching.set(true);
    this.coachFailure.set('');
    this.coaches.set([]);
    this.totalPages.set(0);
    this.totalCount.set(0);

    this.trainersApi.getTrainers(this.siteId(), this.cleanedLookup(), this.page())
      .pipe(
        catchError(failure => {
          this.coachFailure.set(failure.message);

          return of({ items: [], totalCount: 0, pageNumber: this.page(), pageSize: 4, totalPages: 0 });
        }),
        finalize(() =>
          this.coachesFetching.set(false)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(reply => {
        this.coaches.set(reply.items);

        this.pageSize.set(reply.pageSize);

        this.totalCount.set(reply.totalCount);

        this.totalPages.set(reply.totalPages);
      });
  }

  private cleanedLookup(): string {
    const lookup = this.lookup().trim();

    const coachNumber =
      lookup.match(/^#?TR-(\d+)$/i);

    return coachNumber
      ? coachNumber[1]
      : lookup;
  }
}
