import { Injectable, signal } from '@angular/core';
import { MemberDirectoryRecord } from '../../core/models/members/member-directory-record.model';

@Injectable({ providedIn: 'root' })
export class CheckInOverlayService {
  private readonly openState = signal(false);
  private readonly memberState = signal<MemberDirectoryRecord | null>(null);

  readonly isOpen = this.openState.asReadonly();
  readonly member = this.memberState.asReadonly();

  open(member: MemberDirectoryRecord | null = null): void {
    this.memberState.set(member);
    this.openState.set(true);
  }

  close(): void {
    this.openState.set(false);
    this.memberState.set(null);
  }
}
