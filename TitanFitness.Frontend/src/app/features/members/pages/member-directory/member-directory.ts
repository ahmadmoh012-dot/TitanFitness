import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { BranchOption } from '../../../../core/models/branches/branch-option.model';
import { MemberDirectoryRecord } from '../../../../core/models/members/member-directory-record.model';
import { BranchApiService } from '../../../../core/services/branch-api.service';
import { MemberApiService } from '../../../../core/services/member-api.service';
import { BranchFilter } from '../../../../shared/components/branch-filter/branch-filter';
import { Button } from '../../../../shared/components/button/button';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { PageHeading } from '../../../../shared/components/page-heading/page-heading';
import { Pager } from '../../../../shared/components/pager/pager';
import { CheckInOverlayService } from '../../../../shared/services/check-in-overlay.service';
import { MemberAction, MemberDirectoryTable } from '../../components/member-directory-table/member-directory-table';

@Component({
  selector: 'app-member-directory',
  standalone: true,
  imports: [FeedbackBanner, BranchFilter, Button, PageHeading, LoadingState, Pager, MemberDirectoryTable],
  templateUrl: './member-directory.html'
})
export class MemberDirectory implements OnInit {
  private readonly membersApi = inject(MemberApiService);
  private readonly branchesApi = inject(BranchApiService);
  private readonly overlay = inject(CheckInOverlayService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  members = signal<MemberDirectoryRecord[]>([]);
  sites = signal<BranchOption[]>([]);
  siteId = signal<number | null>(null);
  lookup = signal('');
  page = signal(1);
  pageSize = signal(4);
  totalPages = signal(0);
  totalCount = signal(0);

  private readonly loadingBranches = signal(true);
  private readonly loadingMembers = signal(true);

  siteFailure = signal('');
  memberFailure = signal('');

  fetching = computed(() => this.loadingBranches() || this.loadingMembers());
  failure = computed(() => this.siteFailure() || this.memberFailure());

  readonly beginEntry = computed(() => {
    if (!this.totalCount()) return 0;
    return (this.page() - 1) * this.pageSize() + 1;
  });

  readonly finishEntry = computed(() => Math.min(this.page() * this.pageSize(), this.totalCount()));

  ngOnInit(): void {
    this.fetchSites();

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const branch = params.get('branchId');

      this.siteId.set(branch ? Number(branch) : null);
      this.lookup.set(params.get('search') ?? '');
      this.page.set(Number(params.get('page')) || 1);

      this.fetchMembers();
    });
  }

  handleSiteChange(branchId: number | null): void {
    this.router.navigate(['/members'], { queryParams: { branchId, page: 1 }, queryParamsHandling: 'merge' });
  }

  handlePageChange(pageNumber: number): void {
    this.router.navigate(['/members'], { queryParams: { page: pageNumber }, queryParamsHandling: 'merge' });
  }

  startNewMember(): void {
    this.router.navigate(['/members/details'], { queryParams: { mode: 'create' } });
  }

  handleMemberCommand({ action, memberId }: { action: MemberAction; memberId: number }): void {
    switch (action) {
      case 'viewProfile':
        this.router.navigate(['/members/profile'], { queryParams: { memberId } });
        break;
      case 'checkIn':
        this.showCheckInDialog(memberId);
        break;
      case 'bookClass':
        this.router.navigate(['/classes'], { queryParams: { booking: true, memberId } });
        break;
      default:
        this.showPause(memberId);
    }
  }

  private showPause(memberId: number): void {
    this.memberFailure.set('');

    this.membersApi.getCurrentMembership(memberId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ membershipId }) => this.router.navigate(['/members/freeze'], { queryParams: { memberId, membershipId } }),
      error: error => this.memberFailure.set(error.message)
    });
  }

  private fetchSites(): void {
    this.loadingBranches.set(true);
    this.siteFailure.set('');

    this.branchesApi.getBranches()
      .pipe(
        catchError(error => {
          this.siteFailure.set(error.message);
          return of([]);
        }),
        finalize(() => this.loadingBranches.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(branches => this.sites.set(branches));
  }

  private fetchMembers(): void {
    this.loadingMembers.set(true);
    this.memberFailure.set('');
    this.members.set([]);
    this.totalPages.set(0);
    this.totalCount.set(0);

    this.membersApi.getMembers(this.siteId(), this.lookup(), this.page())
      .pipe(
        catchError(error => {
          this.memberFailure.set(error.message);
          return of({ items: [], totalCount: 0, pageNumber: this.page(), pageSize: 4, totalPages: 0 });
        }),
        finalize(() => this.loadingMembers.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(response => {
        this.members.set(response.items);
        this.pageSize.set(response.pageSize);
        this.totalCount.set(response.totalCount);
        this.totalPages.set(response.totalPages);
      });
  }

  private showCheckInDialog(memberId: number): void {
    const member = this.members().find(item => item.memberId === memberId);
    if (member) this.overlay.open(member);
  }
}
