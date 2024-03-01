import { ComponentRef, ElementRef, inject, Injectable, NgZone, OnDestroy, Type, ViewContainerRef } from '@angular/core';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { filter, map, merge, Observable, take } from 'rxjs';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { ComponentPortal } from '@angular/cdk/portal';

type X_POS = 'start' | 'end';
type Y_POS = 'above' | 'below';

@Injectable()
export class PopoverOverlayService<T> implements OnDestroy {
  private _overlay = inject(Overlay);
  private _viewContainerRef = inject(ViewContainerRef);
  private _ngZone = inject(NgZone);

  private isOpened = false;
  private overlayRef?: OverlayRef;
  private componentRef?: ComponentRef<T>;
  private closeStream$?: Observable<Event | undefined>;

  private xPosition: X_POS = 'start';
  private yPosition: Y_POS = 'below';

  setPositions(positions: { xPosition?: X_POS; yPosition?: Y_POS }): this {
    this.xPosition = positions?.xPosition ?? 'start';
    this.yPosition = positions?.yPosition ?? 'below';
    return this;
  }

  open(component: Type<T>, origin: ElementRef): this {
    if (this.isOpened) {
      return this;
    }
    this.createOverlay(component, origin);
    this.isOpened = true;
    return this;
  }

  close(): this {
    if (!this.isOpened) {
      return this;
    }
    this.isOpened = false;
    this.destroyOverlay();
    return this;
  }

  getComponent(): T | undefined {
    return this.componentRef?.instance;
  }

  getCloseStream$(): Observable<Event | undefined> | undefined {
    return this.closeStream$;
  }

  ngOnDestroy(): void {
    this.destroyOverlay();
  }

  private createOverlay(component: Type<T>, origin: ElementRef): void {
    this.destroyOverlay();
    const portal = new ComponentPortal(component, this._viewContainerRef);
    this.overlayRef = this._overlay.create(
      new OverlayConfig({
        positionStrategy: this.createPositionStrategy(origin),
        hasBackdrop: true,
        backdropClass: 'mat-overlay-transparent-backdrop',
        scrollStrategy: this._overlay.scrollStrategies.reposition(),
      }),
    );
    this.closeStream$ = this.getCloseStream(this.overlayRef);
    this.closeStream$.subscribe((event) => {
      event?.preventDefault();
      this.close();
    });
    this.componentRef = this.overlayRef.attach(portal);
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.overlayRef?.updatePosition());
  }

  private destroyOverlay(): void {
    this.closeStream$ = undefined;
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.componentRef = undefined;
  }

  private createPositionStrategy(origin: ElementRef): FlexibleConnectedPositionStrategy {
    const strategy = this._overlay
      .position()
      .flexibleConnectedTo(origin)
      .withFlexibleDimensions(false)
      .withViewportMargin(8)
      .withLockedPosition();
    return this.setConnectedPositions(strategy);
  }

  private setConnectedPositions(strategy: FlexibleConnectedPositionStrategy): FlexibleConnectedPositionStrategy {
    const primaryX = this.xPosition === 'end' ? 'end' : 'start';
    const secondaryX = primaryX === 'start' ? 'end' : 'start';
    const primaryY = this.yPosition === 'above' ? 'bottom' : 'top';
    const secondaryY = primaryY === 'top' ? 'bottom' : 'top';

    return strategy.withPositions([
      {
        originX: primaryX,
        originY: secondaryY,
        overlayX: primaryX,
        overlayY: primaryY,
      },
      {
        originX: primaryX,
        originY: primaryY,
        overlayX: primaryX,
        overlayY: secondaryY,
      },
      {
        originX: secondaryX,
        originY: secondaryY,
        overlayX: secondaryX,
        overlayY: primaryY,
      },
      {
        originX: secondaryX,
        originY: primaryY,
        overlayX: secondaryX,
        overlayY: secondaryY,
      },
    ]);
  }

  private getCloseStream(overlayRef: OverlayRef): Observable<Event | undefined> {
    return merge(
      overlayRef.backdropClick(),
      overlayRef.detachments().pipe(map(() => undefined)),
      overlayRef.keydownEvents().pipe(filter((event) => event.keyCode === ESCAPE && !hasModifierKey(event))),
    );
  }
}
