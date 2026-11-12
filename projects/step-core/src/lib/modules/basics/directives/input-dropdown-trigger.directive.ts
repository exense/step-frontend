import {
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { addAriaReferencedId, getAriaReferenceIds, removeAriaReferencedId } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { animationFrameScheduler, auditTime, filter, fromEvent, merge, Observable, Subject, takeUntil } from 'rxjs';
import { InputDropdownComponent } from '../components/input-dropdown/input-dropdown.component';

const PANEL_GAP = 4;
const MIN_VISIBLE_PART = 0.5;

const observeLayoutChanges = (anchor: HTMLElement, ancestors: HTMLElement[]): Observable<void> =>
  new Observable<void>((subscriber) => {
    const notify = (): void => subscriber.next();

    const resizeObserver = new ResizeObserver(notify);
    [anchor, ...ancestors].forEach((element) => resizeObserver.observe(element));

    const mutationObserver = new MutationObserver(notify);
    mutationObserver.observe(anchor.ownerDocument.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden'],
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  });

@Directive({
  selector: '[stepInputDropdownTrigger]',
  exportAs: 'InputDropdownTrigger',
  host: {
    '(focus)': 'handleFocus()',
    '(blur)': 'handleBlur($event)',
    '(keydown.escape)': 'handleEscape($event)',
  },
})
export class InputDropdownTriggerDirective {
  private _elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private _overlay = inject(Overlay);
  private _viewContainerRef = inject(ViewContainerRef);
  private _destroyRef = inject(DestroyRef);
  private _document = inject(DOCUMENT);
  private _zone = inject(NgZone);

  readonly dropdown = input.required<InputDropdownComponent>({ alias: 'stepInputDropdownTrigger' });
  readonly isDropdownDisabled = input(false, { alias: 'stepInputDropdownDisabled' });

  private overlayRef?: OverlayRef;
  private describedById?: string;
  private readonly closeTerminator$ = new Subject<void>();

  constructor() {
    effect(() => {
      const isDisabled = this.isDropdownDisabled();
      if (isDisabled) {
        untracked(() => this.close());
      }
    });

    this._destroyRef.onDestroy(() => {
      this.close();
      this.overlayRef?.dispose();
      this.overlayRef = undefined;
    });
  }

  protected handleFocus(): void {
    const input = this._elementRef.nativeElement;
    if (this.isDropdownDisabled() || input.disabled || input.readOnly) {
      return;
    }
    this.open();
  }

  protected handleBlur(event: FocusEvent): void {
    if (this.isOwnElement(event.relatedTarget)) {
      return;
    }
    this.close();
  }

  protected handleEscape(event: Event): void {
    if (!this.isOpen()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.close();
  }

  private isOpen(): boolean {
    return !!this.overlayRef?.hasAttached();
  }

  private isOwnElement(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) {
      return false;
    }
    return this._elementRef.nativeElement.contains(target) || !!this.overlayRef?.overlayElement.contains(target);
  }

  private open(): void {
    if (this.isOpen()) {
      return;
    }
    const input = this._elementRef.nativeElement;
    const anchor = input.closest<HTMLElement>('step-form-field') ?? input;

    const overlayRef = this.overlayRef ?? this.createOverlay(anchor);
    this.overlayRef = overlayRef;

    this.applyAnchorWidth(overlayRef, anchor.getBoundingClientRect().width);

    const view = overlayRef.attach(new TemplatePortal(this.dropdown().panelTemplate(), this._viewContainerRef));
    view.detectChanges();
    overlayRef.updatePosition();
    this.addDescribedBy();
    this.trackPanelEvents(overlayRef, anchor);
  }

  private createOverlay(anchor: HTMLElement): OverlayRef {
    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(anchor)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: PANEL_GAP },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -PANEL_GAP },
      ])
      .withFlexibleDimensions(false)
      .withPush(false)
      .withViewportMargin(8);

    return this._overlay.create({
      positionStrategy,
      hasBackdrop: false,
      panelClass: 'step-input-dropdown-pane',
    });
  }

  private applyAnchorWidth(overlayRef: OverlayRef, width: number): void {
    if (width > 0) {
      overlayRef.updateSize({ width });
    }
  }

  private trackPanelEvents(overlayRef: OverlayRef, anchor: HTMLElement): void {
    const panel = overlayRef.overlayElement;

    this.followAnchor(overlayRef, anchor);

    fromEvent<FocusEvent>(panel, 'focusout')
      .pipe(
        filter((event) => !this.isOwnElement(event.relatedTarget)),
        takeUntil(this.closeTerminator$),
      )
      .subscribe(() => this.close());

    fromEvent<KeyboardEvent>(panel, 'keydown')
      .pipe(
        filter((event) => event.key === 'Escape'),
        takeUntil(this.closeTerminator$),
      )
      .subscribe((event) => {
        event.preventDefault();
        event.stopPropagation();
        this._elementRef.nativeElement.focus();
        this.close();
      });
  }

  // Runs outside of the Angular zone and at most once per animation frame, so scrolling does not trigger change detection.
  // Scroll events of arbitrary ancestors do not bubble, so they are caught in the capture phase.
  // Layout shifts that move the anchor without resizing it are detected by the resize and mutation observers.
  private followAnchor(overlayRef: OverlayRef, anchor: HTMLElement): void {
    const ancestors = this.getAncestors(anchor);
    const clippingAncestors = ancestors.filter((element) => this.isClipping(element));
    let lastRect = anchor.getBoundingClientRect();

    this._zone.runOutsideAngular(() => {
      merge(fromEvent(this._document, 'scroll', { capture: true }), observeLayoutChanges(anchor, ancestors))
        .pipe(auditTime(0, animationFrameScheduler), takeUntil(this.closeTerminator$))
        .subscribe(() => {
          const rect = anchor.getBoundingClientRect();
          if (this.isOutOfView(rect, clippingAncestors)) {
            this._zone.run(() => this.close());
            return;
          }
          if (this.isSameRect(rect, lastRect)) {
            return;
          }
          if (rect.width !== lastRect.width) {
            this.applyAnchorWidth(overlayRef, rect.width);
          }
          lastRect = rect;
          overlayRef.updatePosition();
        });
    });
  }

  private getAncestors(element: HTMLElement): HTMLElement[] {
    const result: HTMLElement[] = [];
    let current = element.parentElement;
    while (current && current !== this._document.documentElement) {
      result.push(current);
      current = current.parentElement;
    }
    return result;
  }

  private isClipping(element: HTMLElement): boolean {
    const style = this._document.defaultView?.getComputedStyle(element);
    return !!style && (style.overflowX !== 'visible' || style.overflowY !== 'visible');
  }

  private isOutOfView(anchorRect: DOMRect, clippingAncestors: HTMLElement[]): boolean {
    if (!anchorRect.width || !anchorRect.height) {
      return false;
    }
    const view = this._document.defaultView;
    let left = 0;
    let top = 0;
    let right = view?.innerWidth ?? Infinity;
    let bottom = view?.innerHeight ?? Infinity;

    clippingAncestors.forEach((element) => {
      const rect = element.getBoundingClientRect();
      left = Math.max(left, rect.left);
      top = Math.max(top, rect.top);
      right = Math.min(right, rect.right);
      bottom = Math.min(bottom, rect.bottom);
    });

    const visibleWidth = Math.min(right, anchorRect.right) - Math.max(left, anchorRect.left);
    const visibleHeight = Math.min(bottom, anchorRect.bottom) - Math.max(top, anchorRect.top);
    return visibleWidth < anchorRect.width * MIN_VISIBLE_PART || visibleHeight < anchorRect.height * MIN_VISIBLE_PART;
  }

  private isSameRect(a: DOMRect, b: DOMRect): boolean {
    return a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height;
  }

  private addDescribedBy(): void {
    const id = this.dropdown().panelId;
    const input = this._elementRef.nativeElement;
    if (getAriaReferenceIds(input, 'aria-describedby').includes(id)) {
      return;
    }
    addAriaReferencedId(input, 'aria-describedby', id);
    this.describedById = id;
  }

  private removeDescribedBy(): void {
    const id = this.describedById;
    if (!id) {
      return;
    }
    this.describedById = undefined;
    removeAriaReferencedId(this._elementRef.nativeElement, 'aria-describedby', id);
  }

  private close(): void {
    this.closeTerminator$.next();
    this.removeDescribedBy();
    if (this.overlayRef?.hasAttached()) {
      this.overlayRef.detach();
    }
  }
}
