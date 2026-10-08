import { Pipe, PipeTransform } from '@angular/core';

export type TimeDisplayPart = 'time' | 'period' | 'full';

@Pipe({ name: 'time12Hour', standalone: true })
export class TimeDisplayPipe implements PipeTransform {

  transform(
    value: string,
    part: TimeDisplayPart = 'full'
  ): string {
    if (!value)
      return '';

    const [hour, minute] = value
      .split(':')
      .map(Number);

    const period = hour >= 12
      ? 'PM'
      : 'AM';

    const displayHour = hour % 12 || 12;

    const time =
      `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    if (part === 'time')
      return time;

    if (part === 'period')
      return period;

    return `${time} ${period}`;
  }
}
