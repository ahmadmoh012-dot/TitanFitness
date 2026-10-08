import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-feedback-banner',
  standalone: true,
  imports: [],
  templateUrl: './feedback-banner.html'
})
export class FeedbackBanner {
  type = input<'success' | 'error' | 'warning' | 'info'>('info');
  message = input.required<string>();

  alertClass = computed(() => {
    switch (this.type()) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-danger';
      case 'warning':
        return 'alert-warning';
      default:
        return 'alert-info';
    }
  });
}
