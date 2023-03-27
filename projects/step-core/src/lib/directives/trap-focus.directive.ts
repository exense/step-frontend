import { AfterContentInit, ContentChildren, Directive, HostListener, OnDestroy, QueryList } from '@angular/core';
import { combineLatest, startWith, Subject, takeUntil } from 'rxjs';
import { FocusableDirective } from './focusable.directive';

/**
 * Documentation:
 * https://exense.atlassian.net/wiki/spaces/DEVELOPMEN/pages/587235347/TrapFocusDirective
 */

@Directive({
  selector: '[stepTrapFocus]',
})
export class TrapFocusDirective implements AfterContentInit, OnDestroy {
  @ContentChildren(FocusableDirective, { descendants: true }) focusables?: QueryList<FocusableDirective>;

  private readonly terminator$ = new Subject<void>();

  private lastEvent?: FocusEvent;

  ngAfterContentInit(): void {
    if (!this.focusables) {
      return;
    }

    const focusSubjects = this.focusables.map((focusable) => focusable.focusEvent$.pipe(startWith(undefined)));

    combineLatest(focusSubjects)
      .pipe(takeUntil(this.terminator$))
      .subscribe((focusEvents) => {
        const orderedEvents = focusEvents.filter(Boolean).sort((a, b) => b!.timeStamp - a!.timeStamp);

        this.lastEvent = orderedEvents[0];
      });
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  @HostListener('keydown.tab', ['$event'])
  onHostKeydownTab(event: KeyboardEvent): void {
    event.stopPropagation();

    if (!this.lastEvent || !this.focusables) {
      return;
    }

    const lastEventTargetIndex = this.focusables
      .toArray()
      .map((focusable) => focusable._elementRef.nativeElement)
      .indexOf(this.lastEvent.target as HTMLElement);

    if (lastEventTargetIndex === this.focusables.length - 1) {
      event.preventDefault();

      this.focusables.first._elementRef.nativeElement.focus();
    }
  }

  @HostListener('keydown.shift.tab', ['$event'])
  onHostKeydownShiftTab(event: KeyboardEvent): void {
    event.stopPropagation();

    if (!this.lastEvent || !this.focusables) {
      return;
    }

    const lastEventTargetIndex = this.focusables
      .toArray()
      .map((focusable) => focusable._elementRef.nativeElement)
      .indexOf(this.lastEvent.target as HTMLElement);

    if (lastEventTargetIndex === 0) {
      event.preventDefault();

      this.focusables.last._elementRef.nativeElement.focus();
    }
  }
}
