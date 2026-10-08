import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-profile-photo',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './profile-photo.html',
  host: { class: 'd-block w-100 h-100' }
})
export class ProfilePhoto {
  photo = input<string | null>(null);
  alt = input('Member photo');

  readonly glyph = faUser;
}
