import { Component, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCalendarCheck, faRightToBracket, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../../shared/components/button/button';

export type ShortcutAction = 'newMember' | 'checkIn' | 'registerClass';

@Component({
  selector: 'app-action-shortcuts',
  standalone: true,
  imports: [FontAwesomeModule, Button],
  templateUrl: './action-shortcuts.html'
})
export class ActionShortcuts {
  actionSelected = output<ShortcutAction>();

  readonly commands: { title: string; description: string; icon: IconDefinition; action: ShortcutAction }[] = [
    { title: 'New Member', description: 'Start enrollment process', icon: faUserPlus, action: 'newMember' },
    { title: 'Manual Check-In', description: 'Verify member entry', icon: faRightToBracket, action: 'checkIn' },
    { title: 'Register Class', description: 'Book member into session', icon: faCalendarCheck, action: 'registerClass' }
  ];
}
