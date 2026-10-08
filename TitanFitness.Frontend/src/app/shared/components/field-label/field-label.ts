import { Component, input } from '@angular/core';

@Component({
  selector: 'app-field-label',
  standalone: true,
  templateUrl: './field-label.html'
})
export class FieldLabel {
  forId = input<string | null>(null);
  requiredMark = input(false);
  optionalText = input('');
  block = input(false);
}
