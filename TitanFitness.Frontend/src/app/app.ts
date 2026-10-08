import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { MemberCheckInDialog } from './features/check-in/components/member-check-in-dialog/member-check-in-dialog';
import { SideMenu } from './shared/components/side-menu/side-menu';
import { TopMenu } from './shared/components/top-menu/top-menu';
import { CheckInOverlayService } from './shared/services/check-in-overlay.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SideMenu, TopMenu, MemberCheckInDialog],
  templateUrl: './app.html'
})
export class App {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly checkInOverlay = inject(CheckInOverlayService);

  readonly showLookup = signal(false);
  readonly lookupPlaceholder = signal('Search...');

  constructor() {
    this.modifyTopBar(this.router.url);

    this.router.events
      .pipe(filter(evt => evt instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(evt => this.modifyTopBar(evt.urlAfterRedirects));
  }

  handleLookup(incoming: string): void {
    const address = this.router.url.split('?')[0];

    this.router.navigate([address], {
      queryParams: { search: incoming || null, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  private modifyTopBar(address: string): void {
    const path = address.split('?')[0];

    if (path === '/members') {
      this.showLookup.set(true);
      this.lookupPlaceholder.set('Search members...');
      return;
    }

    if (path === '/trainers') {
      this.showLookup.set(true);
      this.lookupPlaceholder.set('Search trainers...');
      return;
    }

    if (path === '/plans') {
      this.showLookup.set(true);
      this.lookupPlaceholder.set('Search plans...');
      return;
    }

    this.showLookup.set(false);
    this.lookupPlaceholder.set('Search...');
  }
}
