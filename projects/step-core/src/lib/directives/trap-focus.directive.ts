import {
  AfterContentInit,
  ContentChildren,
  DestroyRef,
  Directive,
  HostListener,
  inject,
  QueryList,
} from '@angular/core';
import { combineLatest, startWith } from 'rxjs';
import { FocusableDirective } from './focusable.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Documentation:
 * https://exense.atlassian.net/wiki/spaces/DEVELOPMEN/pages/587235347/TrapFocusDirective
 */

@Directive({
  selector: '[stepTrapFocus]',
  standalone: false,
})
export class TrapFocusDirective implements AfterContentInit {
  private _destroyRef = inject(DestroyRef);

  @ContentChildren(FocusableDirective, { descendants: true }) focusables?: QueryList<FocusableDirective>;

  private lastEvent?: FocusEvent;

  ngAfterContentInit(): void {
    if (!this.focusables) {
      return;
    }

    const focusSubjects = this.focusables.map((focusable) => focusable.focusEvent$.pipe(startWith(undefined)));

    combineLatest(focusSubjects)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((focusEvents) => {
        const orderedEvents = focusEvents.filter(Boolean).sort((a, b) => b!.timeStamp - a!.timeStamp);

        this.lastEvent = orderedEvents[0];
      });
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
