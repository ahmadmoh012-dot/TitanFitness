import { Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartColumn, faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-freeze-impact',
  standalone: true,
  imports: [FontAwesomeModule, Button],
  templateUrl: './freeze-impact.html'
})
export class FreezeImpact {
  originalEndDate = input.required<string>();
  duration = input('—');
  newEndDate = input('');
  canConfirm = input(false);
  saving = input(false);

  confirm = output<void>();
  cancel = output<void>();

  readonly effectGlyph = faChartColumn;
  readonly pauseGlyph = faSnowflake;

  formatDateText(incoming: string): string {
    if (!incoming)
      return '—';

    const [yearPart, monthPart, dayPart] = incoming.split('-').map(Number);

    return new Date(yearPart, monthPart - 1, dayPart).toLocaleDateString(
      'en-US',
      { month: 'short', day: 'numeric', year: 'numeric' }
    );
  }
}
