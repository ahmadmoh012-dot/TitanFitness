import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-heading',
  standalone: true,
  imports: [],
  templateUrl: './page-heading.html'
})
export class PageHeading {
  title = input.required<string>();
  subtitle = input('');
}
