import { Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-back-link',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './back-link.html'
})
export class BackLink {
  label = input.required<string>();
  clicked = output<void>();
  readonly glyph = faArrowLeft;
}
