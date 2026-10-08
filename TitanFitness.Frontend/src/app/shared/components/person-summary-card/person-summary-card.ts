import { Component, computed, input, output } from '@angular/core';
import { StatusChip } from '../status-chip/status-chip';

@Component({
  selector: 'app-person-summary-card',
  standalone: true,
  imports: [StatusChip],
  templateUrl: './person-summary-card.html'
})
export class PersonSummaryCard {
  name = input.required<string>();
  membershipNumber = input.required<string>();
  status = input.required<string>();
  selectable = input(false);
  showInitials = input(true);

  selected = output<void>();

  monogram = computed(() => {
    const segments = this.name().trim().split(/\s+/).filter(Boolean);
    if (segments.length === 0) return '';
    if (segments.length === 1) return segments[0].slice(0, 2).toUpperCase();
    return `${segments[0][0]}${segments[segments.length - 1][0]}`.toUpperCase();
  });

  chooseOption(): void {
    if (this.selectable()) this.selected.emit();
  }
}
