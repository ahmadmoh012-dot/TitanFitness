import { Component, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBars, faBell, faCalendarDays, faCircleUser, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs';
import { Button } from '../button/button';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [FontAwesomeModule, Button],
  templateUrl: './top-menu.html'
})
export class TopMenu implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  showSearch = input(false);
  searchPlaceholder = input('Search...');
  searchChanged = output<string>();

  lookupText = signal('');

  private activePath = '';

  readonly barsGlyph = faBars;
  readonly magnifierGlyph = faMagnifyingGlass;

  readonly commands: { label: string; icon: IconDefinition }[] = [
    { label: 'Notifications', icon: faBell },
    { label: 'Calendar', icon: faCalendarDays },
    { label: 'User profile', icon: faCircleUser }
  ];

  ngOnInit(): void {
    this.activePath = this.getPath(this.router.url);

    this.router.events
      .pipe(
        filter((evt): evt is NavigationEnd => evt instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(evt => {
        const path = this.getPath(evt.urlAfterRedirects);

        if (path !== this.activePath)
          this.lookupText.set('');

        this.activePath = path;
      });
  }

  handleLookup(incoming: string): void {
    this.lookupText.set(incoming);
    this.searchChanged.emit(incoming);
  }

  private getPath(address: string): string {
    return address.split('?')[0];
  }
}
