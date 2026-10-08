import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, distinctUntilChanged, finalize, map, of, Subject, switchMap, take, tap } from 'rxjs';
import { BookingCreateRequest } from '../../../../core/models/bookings/booking-create-request.model';
import { MemberDirectoryRecord } from '../../../../core/models/members/member-directory-record.model';
import { SessionDetails } from '../../../../core/models/scheduling/session-details.model';
import { BookingApiService } from '../../../../core/services/booking-api.service';
import { MemberApiService } from '../../../../core/services/member-api.service';
import { SessionApiService } from '../../../../core/services/session-api.service';
import { Button } from '../../../../shared/components/button/button';
import { FeedbackBanner } from '../../../../shared/components/feedback-banner/feedback-banner';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { MemberPicker } from '../../../../shared/components/member-picker/member-picker';
import { PersonSummaryCard } from '../../../../shared/components/person-summary-card/person-summary-card';
import { TextareaField } from '../../../../shared/components/textarea-field/textarea-field';
import { SessionSummaryCard } from '../../components/session-summary-card/session-summary-card';

@Component({
  selector: 'app-session-booking',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FeedbackBanner,
    Button,
    LoadingState,
    MemberPicker,
    PersonSummaryCard,
    TextareaField,
    SessionSummaryCard
  ],
  templateUrl: './session-booking.html'
})
export class SessionBooking implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionsApi = inject(SessionApiService);
  private readonly membersApi = inject(MemberApiService);
  private readonly bookingsApi = inject(BookingApiService);

  private readonly memberLookup$ = new Subject<string>();

  lesson = signal<SessionDetails | null>(null);
  members = signal<MemberDirectoryRecord[]>([]);
  chosenMember = signal<MemberDirectoryRecord | null>(null);

  private readonly lessonFetching = signal(true);
  private readonly memberFetching = signal(false);

  fetching = computed(() =>
    this.lessonFetching() ||
    this.memberFetching()
  );

  lookupFetching = signal(false);
  submitting = signal(false);
  lookupDone = signal(false);

  lessonFailure = signal('');
  memberFailure = signal('');
  lookupFailure = signal('');
  reservationFailure = signal('');

  failure = computed(() =>
    this.lessonFailure() ||
    this.memberFailure() ||
    this.lookupFailure() ||
    this.reservationFailure()
  );

  finalizable = computed(() => {
    const member = this.chosenMember();
    const lesson = this.lesson();

    return !!member &&
      !!lesson &&
      member.status.toLowerCase() === 'active' &&
      this.lessonBookable(lesson.status) &&
      !this.submitting();
  });

  readonly form = this.fb.group({ trainerNotes: ['', [Validators.maxLength(500)]] });

  ngOnInit(): void {
    this.observeMemberLookup();

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(queryMap => {
        const lessonId = Number(queryMap.get('sessionId'));

        const memberId = Number(queryMap.get('memberId'));

        if (!lessonId || lessonId < 1) {
          this.lessonFetching.set(false);

          this.lessonFailure.set('A class session must be selected.');

          return;
        }

        this.fetchLesson(lessonId);

        if (memberId > 0)
          this.fetchPreselectedMember(memberId);
      });
  }

  lookupMembers(lookup: string): void {
    this.chosenMember.set(null);
    this.memberFailure.set('');
    this.reservationFailure.set('');

    this.memberLookup$.next(lookup);
  }

  pickMember(member: MemberDirectoryRecord): void {
    this.chosenMember.set(member);
    this.members.set([]);
    this.lookupDone.set(false);
    this.lookupFailure.set('');
    this.memberFailure.set('');
    this.reservationFailure.set('');
  }

  finalizeReservation(): void {
    const lesson = this.lesson();
    const member = this.chosenMember();

    if (!lesson || !member)
      return;

    if (member.status.toLowerCase() !== 'active') {
      this.reservationFailure.set('Only a member with an active membership can be booked.');
      return;
    }

    if (!this.lessonBookable(lesson.status)) {
      this.reservationFailure.set('This class session is no longer open for booking.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const reservation: BookingCreateRequest = {
      sessionId: lesson.sessionId,
      memberId: member.memberId,
      trainerNotes:
        this.form.controls.trainerNotes.value?.trim() || null
    };

    this.submitting.set(true);
    this.reservationFailure.set('');

    this.bookingsApi.createBooking(reservation)
      .pipe(take(1), finalize(() => this.submitting.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () =>
          this.location.back(),

        error: failure =>
          this.reservationFailure.set(failure.message)
      });
  }

  abort(): void {
    this.location.back();
  }

  private lessonBookable(status: string): boolean {
    const cleanedState = status.trim().toLowerCase();

    return cleanedState === 'upcoming' ||
      cleanedState === 'open';
  }

  private fetchLesson(lessonId: number): void {
    this.lessonFetching.set(true);
    this.lessonFailure.set('');
    this.lesson.set(null);

    this.sessionsApi
      .getClassSessionById(lessonId)
      .pipe(take(1), finalize(() => this.lessonFetching.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: reply =>
          this.lesson.set(reply),

        error: failure =>
          this.lessonFailure.set(failure.message)
      });
  }

  private fetchPreselectedMember(memberId: number): void {
    this.memberFetching.set(true);
    this.memberFailure.set('');

    this.membersApi.getMemberById(memberId)
      .pipe(
        switchMap(infoReply =>
          this.membersApi.getMembers(null, infoReply.membershipNumber, 1)
        ),
        map(reply =>
          reply.items.find(member => member.memberId === memberId) ?? null
        ),
        take(1),
        finalize(() =>
          this.memberFetching.set(false)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: member => {
          if (!member) {
            this.memberFailure.set('Selected member could not be loaded.');
            return;
          }

          this.chosenMember.set(member);
        },

        error: failure =>
          this.memberFailure.set(failure.message)
      });
  }

  private observeMemberLookup(): void {
    this.memberLookup$
      .pipe(
        map(lookup => lookup.trim()),
        distinctUntilChanged(),

        tap(lookup => {
          this.lookupFailure.set('');
          this.members.set([]);

          this.lookupDone.set(lookup.length > 0);

          this.lookupFetching.set(lookup.length > 0);
        }),

        switchMap(lookup => {
          if (!lookup) {
            this.lookupFetching.set(false);

            return of([] as MemberDirectoryRecord[]);
          }

          return this.membersApi
            .getMembers(null, lookup, 1)
            .pipe(
              map(reply => {
                this.lookupFetching.set(false);

                return reply.items;
              }),

              catchError(failure => {
                this.lookupFetching.set(false);

                this.lookupFailure.set(failure.message);

                return of([] as MemberDirectoryRecord[]);
              })
            );
        }),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(members =>
        this.members.set(members)
      );
  }
}
