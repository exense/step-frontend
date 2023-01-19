import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';

/**
 * In most cases legacy components are displayed over material overlay, but sometimes
 * it appears that we need to show component placed inside material overlay over the legacy component.
 * This directive allows to control the zIndex of .cdk-overlay-container and assign specific value to it,
 * when directive's host is rendered
 */
@Directive({
  selector: '[stepZIndex]',
})
export class ZIndexDirective implements AfterViewInit, OnDestroy {
  @Input('stepZIndex') zIndex?: number;
  private cdkOverlayContainer?: HTMLElement;
  constructor(private _elRef: ElementRef<HTMLElement>) {}

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
