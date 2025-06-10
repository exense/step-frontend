import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { distinctUntilChanged, Subject } from 'rxjs';
import { computed, signal, WritableSignal } from '@angular/core';

const MIN_BUFFER_ITEMS = 10;
const MAX_BUFFER_ITEMS = 20;

export class ItemSizeCalculator {
  constructor(
    minItemSize: number,
    private viewport: CdkVirtualScrollViewport,
  ) {
    this.minItemSize = signal(minItemSize);
  }

  private minItemSize: WritableSignal<number>;
  private itemHeights = signal<number[]>([]);
  private dataLength = signal<number>(0);

  private itemCache = computed(() => {
    const dataLength = this.dataLength();
    const itemHeights = this.itemHeights();
    const minItemSize = this.minItemSize();

    const result = new Array(dataLength);

    for (let i = 0; i < dataLength; i++) {
      const offset = i <= 0 ? 0 : result[i - 1].totalHeight;
      const totalHeight = offset + (itemHeights[i] ?? minItemSize);
      result[i] = { offset, totalHeight };
    }

    return result;
  });

  readonly totalContentSize = computed(() => {
    const itemsCache = this.itemCache();
    return itemsCache[itemsCache.length - 1].totalHeight;
  });

  getIndexByOffset(offset: number): number {
    const itemsCache = this.itemCache();
    for (let i = 0; i < itemsCache.length; i++) {
      if (itemsCache[i].offset >= offset) {
        return i;
      }
    }
    return 0;
  }

  getItemOffset(itemIndex: number): number {
    const itemsCache = this.itemCache();
    itemIndex = Math.min(itemIndex, itemsCache.length - 1);
    itemIndex = Math.max(itemIndex, 0);
    return itemsCache[itemIndex].offset;
  }

  setDataLength(value: number): void {
    this.dataLength.set(value);
  }

  setMinItemSize(minItemSize: number) {
    this.minItemSize.set(minItemSize);
  }

  collectHeightsForCurrentRange(): void {
    const currentHeights = this.itemHeights();
    const heights: number[] = [];
    let hasChanges = false;
    const range = this.viewport.getRenderedRange();

    const elViewport = (this.viewport.elementRef.nativeElement as HTMLElement).firstElementChild as HTMLElement;

    for (let i = range.start, c = 0; i < range.end; i++, c++) {
      const child = elViewport.children.item(c) as HTMLElement;
      let realHeight: number | undefined;
      if (child) {
        realHeight = child.offsetHeight;
      }
      if (realHeight !== undefined && (currentHeights[i] === undefined || currentHeights[i] !== realHeight)) {
        heights[i] = realHeight;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.itemHeights.set([...currentHeights, ...heights]);
    }
  }
}

export class StepVirtualScrollStrategy implements VirtualScrollStrategy {
  private readonly scrolledIndexChangeInternal$ = new Subject<number>();

  readonly scrolledIndexChange = this.scrolledIndexChangeInternal$.pipe(distinctUntilChanged());

  private viewport?: CdkVirtualScrollViewport;

  private itemSizeCalculator?: ItemSizeCalculator;

  constructor(private minItemSize: number) {}

  attach(viewport: CdkVirtualScrollViewport) {
    this.viewport = viewport;
    this.itemSizeCalculator = new ItemSizeCalculator(this.minItemSize, viewport);
    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  detach() {
    this.scrolledIndexChangeInternal$.complete();
    this.viewport = undefined;
    this.itemSizeCalculator = undefined;
  }

  updateMinItemSize(minItemSize: number) {
    this.minItemSize = minItemSize;
    if (this.viewport) {
      if (this.itemSizeCalculator) {
        this.itemSizeCalculator.setMinItemSize(minItemSize);
      } else {
        this.itemSizeCalculator = new ItemSizeCalculator(this.minItemSize, this.viewport);
      }
    }
    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  onContentScrolled() {
    this.updateRenderedRange();
  }

  onDataLengthChanged() {
    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  onContentRendered() {
    /* no-op */
  }

  onRenderedOffsetChanged() {
    /* no-op */
  }

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (this.viewport) {
      const offset = this.itemSizeCalculator!.getItemOffset(index);
      this.viewport.scrollToOffset(offset, behavior);
    }
  }

  private updateTotalContentSize() {
    if (!this.viewport) {
      return;
    }
    this.itemSizeCalculator!.setDataLength(this.viewport.getDataLength());
    this.viewport.setTotalContentSize(this.itemSizeCalculator!.totalContentSize());
  }

  private updateRenderedRange() {
    if (!this.viewport) {
      return;
    }

    const renderedRange = this.viewport.getRenderedRange();
    const newRange = { start: renderedRange.start, end: renderedRange.end };
    const viewportSize = this.viewport.getViewportSize();
    const dataLength = this.viewport.getDataLength();
    let scrollOffset = this.viewport.measureScrollOffset();
    let firstVisibleIndex = this.itemSizeCalculator!.getIndexByOffset(scrollOffset);
    let lastVisibleIndex = this.itemSizeCalculator!.getIndexByOffset(scrollOffset + viewportSize);

    if (newRange.end > dataLength) {
      newRange.start = Math.max(0, firstVisibleIndex);
      newRange.end = Math.max(0, lastVisibleIndex);
    }

    const startBufferItems = firstVisibleIndex - newRange.start;
    if (startBufferItems < MIN_BUFFER_ITEMS && newRange.start !== 0) {
      const expandStart = MAX_BUFFER_ITEMS - startBufferItems;
      newRange.start = Math.max(0, newRange.start - expandStart);
      newRange.end = Math.min(dataLength, lastVisibleIndex + MIN_BUFFER_ITEMS);
    } else {
      const endBufferItems = newRange.end - lastVisibleIndex;
      if (endBufferItems < MIN_BUFFER_ITEMS && newRange.end !== dataLength) {
        const expandEnd = MAX_BUFFER_ITEMS - endBufferItems;
        if (expandEnd > 0) {
          newRange.end = Math.min(dataLength, newRange.end + expandEnd);
          newRange.start = Math.max(0, firstVisibleIndex - MAX_BUFFER_ITEMS);
        }
      }
    }

    this.viewport.setRenderedRange(newRange);
    this.itemSizeCalculator!.collectHeightsForCurrentRange();
    let offset = this.itemSizeCalculator!.getItemOffset(newRange.start);
    this.viewport!.setRenderedContentOffset(offset);
    this.scrolledIndexChangeInternal$.next(Math.floor(firstVisibleIndex));
  }
}
