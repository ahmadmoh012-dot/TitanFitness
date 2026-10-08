import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { EntryDecision } from '../../../../core/models/members/entry-decision.model';

@Component({
  selector: 'app-entry-verdict',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './entry-verdict.html'
})
export class EntryVerdict {
  eligibility = input.required<EntryDecision>();
  branchName = input.required<string>();

  readonly admittedGlyph = faCircleCheck;
  readonly refusedGlyph = faCircleXmark;
}
