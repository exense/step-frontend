import { AutoSizeVirtualScrollStrategy, ItemSizeAverager } from '@angular/cdk-experimental/scrolling';
import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { ListRange } from '@angular/cdk/collections';

export class StepAutosizeVirtualScrollStrategy extends AutoSizeVirtualScrollStrategy implements VirtualScrollStrategy {
  private viewportInternal: CdkVirtualScrollViewport | null = null;

  constructor(
    private minBufferPxInternal: number,
    private maxBufferPxInternal: number,
    private averagerInternal = new ItemSizeAverager(),
  ) {
    super(minBufferPxInternal, maxBufferPxInternal, averagerInternal);
  }

  override attach(viewport: CdkVirtualScrollViewport) {
    super.attach(viewport);
    this.viewportInternal = viewport;
  }

  override detach() {
    super.detach();
    this.viewportInternal = null;
  }

  scrollToIndexApproximately(index: number): void {
    if (!this.viewportInternal) {
      return;
    }
    const viewport = this.viewportInternal!;

    const currentRange = viewport.getRenderedRange();
    if (index >= currentRange.start && index < currentRange.end) {
      return;
    }

    const itemSize = this.averagerInternal.getAverageItemSize();

    viewport.scrollToOffset(index * itemSize);
    const viewportSize = Math.ceil(viewport.getViewportSize() / itemSize);
    const range: ListRange = {
      start: index,
      end: index + viewportSize,
    };
    viewport.setRenderedRange(range);
    super.onContentScrolled();
  }

  override onDataLengthChanged(): void {
    this.averagerInternal.reset();
    super.onDataLengthChanged();
  }

  override onContentScrolled(): void {
    super.onContentScrolled();
    const viewport = this.viewportInternal;
    if (!viewport) {
      return;
    }
    const contentWrapperRect = viewport._contentWrapper.nativeElement.getBoundingClientRect();
    const viewportRect = viewport.elementRef.nativeElement.getBoundingClientRect();

    let diff = 0;
    if (contentWrapperRect.height > viewportRect.height && viewportRect.bottom > contentWrapperRect.bottom) {
      diff = viewportRect.bottom - contentWrapperRect.bottom;
    }
    if (diff > 0) {
      viewport.elementRef.nativeElement.scrollTop -= diff / 2;
    }
  }
}
