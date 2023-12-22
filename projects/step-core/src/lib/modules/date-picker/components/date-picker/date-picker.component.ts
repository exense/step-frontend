import {
  Component,
  ComponentRef,
  inject,
  Input,
  NgZone,
  OnDestroy,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { DateField } from '../../types/date-field';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DatePickerContentComponent } from '../date-picker-content/date-picker-content.component';
import { filter, map, merge, Observable, take } from 'rxjs';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { DateFieldContainerService } from '../../injectables/date-field-container.service';
import { STEP_DATE_TIME_FORMAT_PROVIDERS } from '../../injectables/step-date-format-config.providers';

@Component({
  selector: 'step-date-picker',
  template: '',
  encapsulation: ViewEncapsulation.None,
  exportAs: 'DatePicker',
  providers: [...STEP_DATE_TIME_FORMAT_PROVIDERS, DateFieldContainerService],
})
export class DatePickerComponent implements OnDestroy {
  private _overlay = inject(Overlay);
  private _viewContainerRef = inject(ViewContainerRef);
  private _ngZone = inject(NgZone);

  private _fieldContainer = inject(DateFieldContainerService);

  private isOpened = false;

  private overlayRef?: OverlayRef;
  private componentRef?: ComponentRef<DatePickerContentComponent>;

  @Input() xPosition: 'start' | 'end' = 'start';
  @Input() yPosition: 'above' | 'below' = 'below';

  ngOnDestroy(): void {
    this.destroyOverlay();
  }

  registerInput(dateField: DateField<unknown>): void {
    this._fieldContainer.register(dateField);
  }

  open(): void {
    if (this.isOpened || this._fieldContainer.isFieldDisabled()) {
      return;
    }
    this.createOverlay();
    this.isOpened = true;
  }

  close(): void {
    if (!this.isOpened) {
      return;
    }
    this.isOpened = false;
    this.destroyOverlay();
  }

  private createOverlay(): void {
    this.destroyOverlay();
    const portal = new ComponentPortal(DatePickerContentComponent, this._viewContainerRef);
    const overlayRef = this._overlay.create(
      new OverlayConfig({
        positionStrategy: this.createPositionStrategy(),
        hasBackdrop: true,
        backdropClass: 'mat-overlay-transparent-backdrop',
        scrollStrategy: this._overlay.scrollStrategies.reposition(),
      })
    );
    this.overlayRef = overlayRef;
    this.getCloseStream(overlayRef).subscribe((event) => {
      event?.preventDefault();
      this.close();
    });

    this.componentRef = overlayRef.attach(portal);
    this._ngZone.onStable.pipe(take(1)).subscribe(() => overlayRef.updatePosition());
  }

  private destroyOverlay(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.componentRef = undefined;
  }

  private createPositionStrategy(): FlexibleConnectedPositionStrategy {
    const strategy = this._overlay
      .position()
      .flexibleConnectedTo(this._fieldContainer.getConnectedOverlayOrigin()!)
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
      overlayRef.keydownEvents().pipe(filter((event) => event.keyCode === ESCAPE && !hasModifierKey(event)))
    );
  }
}
