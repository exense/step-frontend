import { OverlayContainer } from '@angular/cdk/overlay';
import { AfterViewInit, Directive, inject, Input, OnDestroy } from '@angular/core';

/**
 * In most cases legacy components are displayed over material overlay, but sometimes
 * it appears that we need to show component placed inside material overlay over the legacy component.
 * This directive allows to control the zIndex of .cdk-overlay-container and assign specific value to it,
 * when directive's host is rendered
 */
@Directive({
  selector: '[stepZIndex]',
  standalone: false,
})
export class ZIndexDirective implements AfterViewInit, OnDestroy {
  private static zIndexStack: number[] = [];

  private static get lastZIndex(): number | undefined {
    return this.zIndexStack[this.zIndexStack.length - 1];
  }

  private _overlayContainer = inject(OverlayContainer);

  @Input('stepZIndex') zIndex?: number;
  private cdkOverlayContainer?: HTMLElement;

  ngAfterViewInit(): void {
    if (this.zIndex === undefined) {
      return;
    }
    this.cdkOverlayContainer = this._overlayContainer.getContainerElement() || undefined;
    if (!this.cdkOverlayContainer) {
      return;
    }
    this.cdkOverlayContainer.style.zIndex = this.zIndex.toString();
    ZIndexDirective.zIndexStack.push(this.zIndex);
  }

  ngOnDestroy(): void {
    if (!this.cdkOverlayContainer) {
      return;
    }
    ZIndexDirective.zIndexStack.pop();
    if (ZIndexDirective.lastZIndex === undefined) {
      this.cdkOverlayContainer.style.removeProperty('z-index');
    } else {
      this.cdkOverlayContainer.style.zIndex = ZIndexDirective.lastZIndex.toString();
    }
    this.cdkOverlayContainer = undefined;
  }
}
