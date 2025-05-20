import { AutoSizeVirtualScrollStrategy, ItemSizeAverager } from '@angular/cdk-experimental/scrolling';
import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { ListRange } from '@angular/cdk/collections';
import { map, Observable, of, timer } from 'rxjs';

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

  scrollToIndexApproximately(index: number): Observable<void> {
    if (!this.viewportInternal) {
      return of(undefined);
    }
    const itemSize = this.averagerInternal.getAverageItemSize();
    const viewportSize = Math.ceil(this.viewportInternal.getViewportSize() / itemSize);
    const range: ListRange = {
      start: index,
      end: index + viewportSize,
    };
    this.viewportInternal.scrollToOffset(index * itemSize);
    this.viewportInternal!.setRenderedRange(range);
    return timer(250).pipe(map(() => {}));
  }

  override onDataLengthChanged(): void {
    this.averagerInternal.reset();
    super.onDataLengthChanged();
  }
}
