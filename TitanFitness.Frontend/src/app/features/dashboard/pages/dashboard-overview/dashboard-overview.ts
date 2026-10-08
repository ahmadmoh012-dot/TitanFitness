import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faRightToBracket, faUsers } from '@fortawesome/free-solid-svg-icons';
import { catchError, finalize, forkJoin, Observable, of } from 'rxjs';
import { CheckInSummary } from '../../../../core/models/dashboard/check-in-summary.model';
import { MemberActivitySummary } from '../../../../core/models/dashboard/member-activity-summary.model';
import { UpcomingSession } from '../../../../core/models/dashboard/upcoming-session.model';
import { DashboardApiService } from '../../../../core/services/dashboard-api.service';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { PageHeading } from '../../../../shared/components/page-heading/page-heading';
import { CheckInOverlayService } from '../../../../shared/services/check-in-overlay.service';
import { ActionShortcuts, ShortcutAction } from '../../components/action-shortcuts/action-shortcuts';
import { MetricCard } from '../../components/metric-card/metric-card';
import { UpcomingSessionList } from '../../components/upcoming-session-list/upcoming-session-list';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [FeedbackBanner, PageHeading, LoadingState, ActionShortcuts, MetricCard, UpcomingSessionList],
  templateUrl: './dashboard-overview.html'
})
export class DashboardOverview implements OnInit {
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly checkInOverlay = inject(CheckInOverlayService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  checkInsToday = signal(0);
  pctChange = signal(0);
  activeMembers = signal(0);
  currentlyInside = signal(0);
  upcomingClasses = signal<UpcomingSession[]>([]);
  fetching = signal(true);
  failure = signal('');

  readonly figures = computed<{
    title: string;
    value: number;
    subtitle: string;
    icon: IconDefinition;
  }[]>(() => [
    {
      title: 'Check-ins Today',
      value: this.checkInsToday(),
      subtitle: `${this.pctChange() >= 0 ? '+' : ''}${this.pctChange()}% vs last week`,
      icon: faRightToBracket
    },
    {
      title: 'Active Members',
      value: this.activeMembers(),
      subtitle: `Currently on floor: ${this.currentlyInside()}`,
      icon: faUsers
    }
  ]);

  ngOnInit(): void {
    this.fetchDashboard();
  }

  handleQuickCommand(command: ShortcutAction): void {
    if (command === 'newMember') {
      this.router.navigate(['/members/details'], { queryParams: { mode: 'create' } });
      return;
    }

    if (command === 'checkIn') {
      this.showCheckInDialog();
      return;
    }

    if (command === 'registerClass') {
      this.router.navigate(['/classes'], { queryParams: { booking: true } });
      return;
    }
  }

  goToSchedule(): void {
    this.router.navigate(['/classes']);
  }

  private fetchDashboard(): void {
    this.fetching.set(true);
    this.failure.set('');

    forkJoin({
      checkIns: this.dashboardApi.getCheckInsToday()
        .pipe(
          catchError(failure =>
            this.getFallback<CheckInSummary>({ checkInsToday: 0, percentageChange: 0 }, failure)
          )
        ),

      activeMembers: this.dashboardApi.getActiveMembers()
        .pipe(
          catchError(failure =>
            this.getFallback<MemberActivitySummary>({ activeMembers: 0, currentlyInside: 0 }, failure)
          )
        ),

      upcomingClasses: this.dashboardApi.getUpcomingClasses()
        .pipe(catchError(failure => this.getFallback<UpcomingSession[]>([], failure)))
    })
      .pipe(finalize(() => this.fetching.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe(reply => {
        this.checkInsToday.set(reply.checkIns.checkInsToday);

        this.pctChange.set(reply.checkIns.percentageChange);

        this.activeMembers.set(reply.activeMembers.activeMembers);

        this.currentlyInside.set(reply.activeMembers.currentlyInside);

        this.upcomingClasses.set(reply.upcomingClasses.slice(0, 2));
      });
  }

  private getFallback<T>(
    payload: T,
    failure: unknown
  ): Observable<T> {
    this.creationFailure(failure instanceof Error ? failure.message : 'Something went wrong.');

    return of(payload);
  }

  private creationFailure(text: string): void {
    const active = this.failure();

    if (!active) {
      this.failure.set(text);
      return;
    }

    if (!active.includes(text))
      this.failure.set(`${active} ${text}`);
  }

  private showCheckInDialog(): void {
    this.checkInOverlay.open();
  }
}
