import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCalendarDays, faChartColumn, faClipboardList, faDumbbell, faRightToBracket, faUsers, faXmark } from '@fortawesome/free-solid-svg-icons';
import { CheckInOverlayService } from '../../services/check-in-overlay.service';
import { Button } from '../button/button';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule, Button],
  templateUrl: './side-menu.html'
})
export class SideMenu {
  private readonly checkInOverlay = inject(CheckInOverlayService);

  readonly enterGlyph = faRightToBracket;
  readonly crossGlyph = faXmark;

  readonly entries: {
    label: string;
    link: string;
    icon: IconDefinition;
  }[] = [
      { label: 'Dashboard', link: '/dashboard', icon: faChartColumn },
      { label: 'Members', link: '/members', icon: faUsers },
      { label: 'Classes', link: '/classes', icon: faCalendarDays },
      { label: 'Trainers', link: '/trainers', icon: faDumbbell },
      { label: 'Plans', link: '/plans', icon: faClipboardList }
    ];

  showCheckInDialog(): void {
    this.checkInOverlay.open();
  }
}
