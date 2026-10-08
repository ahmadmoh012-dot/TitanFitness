import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-usage-meter-card',
  standalone: true,
  imports: [],
  templateUrl: './usage-meter-card.html'
})
export class UsageMeterCard {
  title = input.required<string>();
  used = input.required<number>();
  allowed = input.required<number>();
  itemName = input.required<string>();

  left = computed(() =>
    Math.max(this.allowed() - this.used(), 0)
  );

  progressPct = computed(() => {
    if (this.allowed() <= 0 || this.used() <= 0)
      return 0;

    const pct =
      (this.used() / this.allowed()) * 100;

    return Math.min(pct, 100);
  });
}
