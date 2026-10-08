import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-info-banner',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './info-banner.html'
})
export class InfoBanner {
  readonly glyph = faCircleInfo;
}
