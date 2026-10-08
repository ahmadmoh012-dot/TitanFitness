import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './empty-state.html'
})
export class EmptyState {
  title = input.required<string>();
  compact = input(false);
}
