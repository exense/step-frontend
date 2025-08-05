import { AfterContentInit, ContentChildren, Directive, Input, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { FocusableDirective } from './focusable.directive';

/**
 * Documentation:
 * https://exense.atlassian.net/wiki/spaces/DEVELOPMEN/pages/587038757/FocusablesDirective
 */

@Directive({
  selector: '[stepFocusables]',
  exportAs: 'stepFocusables',
  standalone: false,
})
export class FocusablesDirective implements AfterContentInit {
  @Input() focusIndex: number = 0;

  @ContentChildren(FocusableDirective, { descendants: true }) focusables?: QueryList<FocusableDirective>;

  private focusSubjectByIndex?: Map<number, Subject<void>>;

  ngAfterContentInit(): void {
    if (!this.focusables) {
      return;
    }

    this.focusSubjectByIndex = new Map(this.focusables.map((focusable, index) => [index, focusable.focus$]));
  }

  refocus(): void {
    if (!this.focusSubjectByIndex) {
      return;
    }

    const focusSubject = this.focusSubjectByIndex.get(this.focusIndex);

    if (!focusSubject) {
      return;
    }

    focusSubject.next();
  }

  scheduleRefocus(milliseconds?: number): void {
    setTimeout(() => {
      this.refocus();
    }, milliseconds);
  }
}
