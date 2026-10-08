import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './metric-card.html'
})
export class MetricCard {
  title = input.required<string>();
  value = input.required<string | number>();
  subtitle = input('');
  icon = input.required<IconDefinition>();
}
