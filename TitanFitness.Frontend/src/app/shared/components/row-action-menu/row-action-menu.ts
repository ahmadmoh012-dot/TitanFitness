import { Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../button/button';

export interface RowActionItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-row-action-menu',
  standalone: true,
  imports: [FontAwesomeModule, Button],
  templateUrl: './row-action-menu.html'
})
export class RowActionMenu {
  actions = input.required<RowActionItem[]>();
  actionSelected = output<string>();

  readonly dotsGlyph = faEllipsisVertical;
}
