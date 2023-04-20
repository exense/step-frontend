import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Injectable({
  providedIn: 'root',
})
export class GlobalProgressSpinnerService {
  private spinnerOverlayRef: OverlayRef | null = null;

  private _overlay = inject(Overlay);

  private createSpinnerOverlay(): OverlayRef {
    // Define overlay configuration
    const config = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy: this._overlay.position().global().centerHorizontally().centerVertically(),
    });

    // Create and attach overlay to the DOM
    const overlayRef = this._overlay.create(config);

    // Create a portal to render the mat-spinner component
    const spinnerPortal = new ComponentPortal(MatProgressSpinner);

    // Attach the portal to the overlay
    const spinnerComponentRef = overlayRef.attach(spinnerPortal);

    // Set spinner mode to 'indeterminate'
    spinnerComponentRef.instance.mode = 'indeterminate';

    // Return the overlayRef to control its lifecycle (e.g., hiding or disposing of it)
    return overlayRef;
  }

  showSpinner(): void {
    if (!this.spinnerOverlayRef) {
      this.spinnerOverlayRef = this.createSpinnerOverlay();
    }
  }

  hideSpinner(): void {
    this.spinnerOverlayRef?.dispose();
    this.spinnerOverlayRef = null;
  }
}
