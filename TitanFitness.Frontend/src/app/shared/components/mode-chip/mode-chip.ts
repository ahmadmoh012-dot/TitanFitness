import { Component, input } from '@angular/core';

@Component({
  selector: 'app-mode-chip',
  standalone: true,
  imports: [],
  templateUrl: './mode-chip.html'
})
export class ModeChip {
  mode = input.required<'add' | 'edit' | 'view'>();
}
