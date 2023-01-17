import { AfterViewInit, Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'step-modal-window',
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.scss'],
})
export class ModalWindowComponent implements AfterViewInit, OnDestroy {
  @Input() title: string = '';

  /**
   * Sometimes it's require to show the migrated modal above the legacy one
   * This input can be used to specify the z-index for .cdk-overlay-container when modal appears
   * As soon as all modals will be migrated, this logic should be removed
   */
  @Input() zIndex?: number;
  private cdkOverlayContainer?: HTMLElement;
  constructor(private _elRef: ElementRef<HTMLElement>, public _dialogRef: MatDialogRef<unknown>) {}

  ngAfterViewInit(): void {
    if (this.zIndex === undefined) {
      return;
    }
    this.cdkOverlayContainer = this._elRef.nativeElement.closest<HTMLElement>('.cdk-overlay-container') || undefined;
    if (!this.cdkOverlayContainer) {
      return;
    }
    this.cdkOverlayContainer.style.zIndex = this.zIndex.toString();
  }

  ngOnDestroy(): void {
    if (!this.cdkOverlayContainer) {
      return;
    }
    this.cdkOverlayContainer.style.removeProperty('z-index');
    this.cdkOverlayContainer = undefined;
  }
}
