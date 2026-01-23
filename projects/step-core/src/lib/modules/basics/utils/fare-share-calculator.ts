class FareShareWidthContainer {
  private total = 0;

  get totalWidth(): number {
    return this.total;
  }

  addWidth(width?: number): void {
    this.total += width ?? 0;
  }
}

export class FareShareCalculator {
  private fareShare: number;
  private fareShareApplied: number = 0;
  private containers: FareShareWidthContainer[] = [];

  constructor(
    private readonly itemMinWidth: number,
    private readonly gap: number,
    private readonly availableWidth: number,
    private readonly totalCount: number,
    private readonly padding: number = 0,
  ) {
    this.fareShare = Math.round(availableWidth / totalCount);
    if (this.fareShare < itemMinWidth) {
      this.fareShare = itemMinWidth;
    }
  }

  private get recentContainer(): FareShareWidthContainer {
    return this.containers[this.containers.length - 1];
  }

  openContainer(): void {
    this.containers.push(new FareShareWidthContainer());
  }

  applyFairShare(itemWidth?: number): number | undefined {
    let result: number | undefined = undefined;
    if (itemWidth !== undefined && itemWidth > this.fareShare) {
      this.fareShareApplied++;
      result = this.fareShare;
    } else {
      result = itemWidth;
    }
    this.recentContainer.addWidth(result);
    return result;
  }

  reallocate(): boolean {
    const totalWidth = this.countTotalWidth();
    if (totalWidth >= this.availableWidth || !this.fareShareApplied) {
      return false;
    }
    const unallocated = this.availableWidth - totalWidth;
    this.fareShare = this.fareShare + Math.round(unallocated / this.fareShareApplied);
    if (this.fareShare < this.itemMinWidth) {
      this.fareShare = this.itemMinWidth;
    }
    this.fareShareApplied = 0;
    this.containers = [];
    return true;
  }

  private countTotalWidth(): number {
    return FareShareCalculator.calculateWidths(this.containers, this.gap, this.padding);
  }

  static calculateWidths(widthContainers: { totalWidth?: number }[], gap: number, padding: number = 0): number {
    return widthContainers
      .filter((item) => !!item.totalWidth)
      .map((item) => item.totalWidth!)
      .reduce((res, total, index, self) => {
        let value = res + total + padding;
        if (index < self.length - 1) {
          value += gap;
        }
        return value;
      }, 0);
  }
}
