import {
  DestroyRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Documentation:
 * https://exense.atlassian.net/wiki/spaces/DEVELOPMEN/pages/587399169/FocusableDirective
 */

@Directive({
  selector: '[stepFocusable]',
  host: {
    '[attr.tabindex]': '0',
  },
  standalone: false,
})
export class FocusableDirective implements OnInit, OnDestroy {
  private _destroyRef = inject(DestroyRef);
  _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() focus$ = new Subject<void>();
  @Input() defaultSpace: boolean = true;

  @Output() keydownSpace = new EventEmitter<void>();

  readonly focusEvent$ = new Subject<FocusEvent>();

  ngOnInit(): void {
    this.focus$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      this._elementRef.nativeElement.focus();
    });
  }

  ngOnDestroy(): void {
    this.focus$.complete();
    this.focusEvent$.complete();
  }

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent): void {
    this.focusEvent$.next(event);
  }

  @HostListener('keydown.space', ['$event'])
  onKeydownSpace(event: KeyboardEvent): void {
    if (this.defaultSpace) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.keydownSpace.emit();
  }
}
