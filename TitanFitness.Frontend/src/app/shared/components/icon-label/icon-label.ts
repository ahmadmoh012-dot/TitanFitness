import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-icon-label',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './icon-label.html'
})
export class IconLabel {
  icon = input.required<IconDefinition>();
  iconClass = input('me-1');
}
