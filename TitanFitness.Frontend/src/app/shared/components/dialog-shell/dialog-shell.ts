import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-dialog-shell',
  standalone: true,
  imports: [],
  templateUrl: './dialog-shell.html'
})
export class DialogShell {
  title = input.required<string>();
  closeDisabled = input(false);
  closed = output<void>();
}
