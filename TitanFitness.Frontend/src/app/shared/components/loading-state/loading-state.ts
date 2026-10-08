import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [],
  templateUrl: './loading-state.html'
})
export class LoadingState {
  message = input('Loading...');
}
