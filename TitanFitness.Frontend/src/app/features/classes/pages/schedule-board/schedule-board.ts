import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { BranchOption } from '../../../../core/models/branches/branch-option.model';
import { DayCapacitySummary } from '../../../../core/models/scheduling/day-capacity-summary.model';
import { SessionListRecord } from '../../../../core/models/scheduling/session-list-record.model';
import { BranchApiService } from '../../../../core/services/branch-api.service';
import { SessionApiService } from '../../../../core/services/session-api.service';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { PageHeading } from '../../../../shared/components/page-heading/page-heading';
import { Pager } from '../../../../shared/components/pager/pager';
import { CapacitySummary } from '../../components/capacity-summary/capacity-summary';
import { ScheduleToolbar } from '../../components/schedule-toolbar/schedule-toolbar';
import { SessionCreateDialog } from '../../components/session-create-dialog/session-create-dialog';
import { SessionList } from '../../components/session-list/session-list';

@Component({
  selector: 'app-schedule-board',
  standalone: true,
  imports: [
    FeedbackBanner,
    PageHeading,
    LoadingState,
    Pager,
    SessionCreateDialog,
    CapacitySummary,
    ScheduleToolbar,
    SessionList
  ],
  templateUrl: './schedule-board.html'
})
export class ScheduleBoard implements OnInit {
  private readonly branchesApi = inject(BranchApiService);
  private readonly sessionsApi = inject(SessionApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  sites = signal<BranchOption[]>([]);
  lessons = signal<SessionListRecord[]>([]);

  rollup = signal<DayCapacitySummary>({ totalBookings: 0, averageFillRate: 0 });

  siteId = signal<number | null>(null);
  date = signal('');
  page = signal(1);
  totalPages = signal(0);
  totalCount = signal(0);

  reservationMode = signal(false);
  reservationMemberId = signal<number | null>(null);

  showLessonDialog = signal(false);

  private readonly sitesFetching = signal(true);
  private readonly scheduleFetching = signal(true);

  fetching = computed(() =>
    this.sitesFetching() ||
    this.scheduleFetching()
  );

  siteFailure = signal('');
  scheduleFailure = signal('');
  rollupFailure = signal('');

  failure = computed(() =>
    this.siteFailure() ||
    this.scheduleFailure() ||
    this.rollupFailure()
  );

  ngOnInit(): void {
    this.fetchSites();

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(queryMap => {
        const siteId = queryMap.get('branchId');
        const date = queryMap.get('date');
        const memberId = Number(queryMap.get('memberId'));

        this.siteId.set(siteId ? Number(siteId) : null);

        this.date.set(date || this.currentDay());

        this.page.set(Number(queryMap.get('page')) || 1);

        this.reservationMode.set(queryMap.get('booking') === 'true');

        this.reservationMemberId.set(memberId > 0 ? memberId : null);

        this.fetchSchedule();
      });
  }

  handleSiteChange(siteId: number | null): void {
    this.router.navigate(['/classes'], {
      queryParams: { branchId: siteId, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  handleDateChange(date: string): void {
    this.router.navigate(['/classes'], { queryParams: { date, page: 1 }, queryParamsHandling: 'merge' });
  }

  handlePageChange(page: number): void {
    this.router.navigate(['/classes'], { queryParams: { page }, queryParamsHandling: 'merge' });
  }

  pickReservationLesson(lessonId: number): void {
    if (!this.reservationMode())
      return;

    const navParams: {
      sessionId: number;
      memberId?: number;
    } = {
      sessionId: lessonId
    };

    const memberId = this.reservationMemberId();

    if (memberId)
      navParams.memberId = memberId;

    this.router.navigate(['/classes/book-session'], { queryParams: navParams });
  }

  startNewClass(): void {
    this.showLessonDialog.set(true);
  }

  dismissLessonDialog(): void {
    this.showLessonDialog.set(false);
  }

  handleClassCreated(evt: { branchId: number; date: string }): void {
    this.showLessonDialog.set(false);

    if (
      this.siteId() === evt.branchId &&
      this.date() === evt.date &&
      this.page() === 1
    ) {
      this.fetchSchedule();
      return;
    }

    this.router.navigate(['/classes'], {
      queryParams: { branchId: evt.branchId, date: evt.date, page: 1 },
      queryParamsHandling: 'merge'
    });
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

  private fetchSchedule(): void {
    this.scheduleFetching.set(true);
    this.scheduleFailure.set('');
    this.rollupFailure.set('');

    forkJoin({
      sessions: this.sessionsApi
        .getClassSessions(this.siteId(), this.date(), this.page())
        .pipe(
          catchError(failure => {
            this.scheduleFailure.set(failure.message);

            return of({ items: [], totalCount: 0, pageNumber: this.page(), pageSize: 10, totalPages: 0 });
          })
        ),

      summary: this.sessionsApi
        .getDaySummary(this.siteId(), this.date())
        .pipe(
          catchError(failure => {
            this.rollupFailure.set(failure.message);

            return of({ totalBookings: 0, averageFillRate: 0 });
          })
        )
    })
      .pipe(finalize(() => this.scheduleFetching.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe(reply => {
        this.lessons.set(reply.sessions.items);

        this.totalCount.set(reply.sessions.totalCount);

        this.totalPages.set(reply.sessions.totalPages);

        this.rollup.set(reply.summary);
      });
  }

  private currentDay(): string {
    const currentDay = new Date();
    const yearPart = currentDay.getFullYear();
    const monthPart = String(currentDay.getMonth() + 1).padStart(2, '0');
    const dayPart = String(currentDay.getDate()).padStart(2, '0');

    return `${yearPart}-${monthPart}-${dayPart}`;
  }
}
