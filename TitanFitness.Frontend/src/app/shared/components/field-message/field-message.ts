import { Component, input } from '@angular/core';

@Component({
  selector: 'app-field-message',
  standalone: true,
  templateUrl: './field-message.html'
})
export class FieldMessage {
  type = input<'error' | 'helper'>('helper');
  block = input(true);
  marginTop = input(true);
}
