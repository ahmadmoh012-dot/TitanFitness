import { Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pager',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './pager.html'
})
export class Pager {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageChanged = output<number>();
  readonly previousGlyph = faChevronLeft;
  readonly nextGlyph = faChevronRight;

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, position) => position + 1));

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.pageChanged.emit(page);
  }
}
