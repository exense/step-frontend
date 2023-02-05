import { Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[stepFocusable]',
  host: {
    '[attr.tabindex]': '0',
  },
})
export class FocusableDirective implements OnInit, OnDestroy {
  @Input() focus$ = new Subject<void>();
  @Input() defaultSpace: boolean = true;

  @Output() keydownSpace = new EventEmitter<void>();

  private readonly terminator$ = new Subject<void>();

  readonly focusEvent$ = new Subject<FocusEvent>();

  constructor(public _elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.focus$.pipe(takeUntil(this.terminator$)).subscribe(() => {
      this._elementRef.nativeElement.focus();
    });
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
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
