import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [],
  templateUrl: './status-chip.html'
})
export class StatusChip {
  status = input.required<string>();

  badgeClass = computed(() => {
    const incoming = this.status().trim().toLowerCase();

    if (['active', 'open', 'booked', 'attended', 'admitted'].includes(incoming)) return 'status-positive';
    if (['upcoming', 'published', 'pending'].includes(incoming)) return 'status-neutral';
    if (['frozen', 'in progress', 'waitlisted'].includes(incoming)) return 'status-warning';
    if (['expired', 'cancelled', 'refused', 'no show', 'retired', 'inactive'].includes(incoming)) return 'status-negative';
    return 'status-muted';
  });
}
