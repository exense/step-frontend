import { Component, computed, inject, signal, untracked } from '@angular/core';
import { SplitComponent } from '../split/split.component';

@Component({
  selector: 'step-split-gutter',
  templateUrl: './split-gutter.component.html',
  styleUrls: ['./split-gutter.component.scss'],
  host: {
    '[class.active]': 'active()',
    '(mousedown)': 'handleMouseDown($event)',
    '(window:mousemove)': 'handleMouseMove($event)',
    '(window:mouseup)': 'handleMouseUp()',
  },
})
export class SplitGutterComponent {
  private _splitComponent = inject(SplitComponent);
  private eventX?: number;
  private leftAreaWidth?: number;
  private rightAreaWidth?: number;

  protected readonly active = signal(false);

  private readonly allGutters = computed(() => this._splitComponent.gutters());
  private readonly allAreas = computed(() => this._splitComponent.areas());

  private readonly gutterIndex = computed(() => {
    const gutters = this.allGutters() ?? [];
    return gutters.indexOf(this);
  });

  private readonly leftArea = computed(() => {
    const areas = this.allAreas();
    const gutterIndex = this.gutterIndex();
    if (!areas.length || gutterIndex < 0) {
      return undefined;
    }
    return areas[gutterIndex];
  });

  private readonly rightArea = computed(() => {
    const areas = this.allAreas();
    const gutterIndex = this.gutterIndex();
    if (!areas.length || gutterIndex < 0) {
      return undefined;
    }
    return areas[gutterIndex + 1];
  });

  updateSizes(): void {
    const leftArea = untracked(() => this.leftArea());
    const rightArea = untracked(() => this.rightArea());

    if (!leftArea || !rightArea) {
      return;
    }
    this.leftAreaWidth = leftArea.width;
    this.rightAreaWidth = rightArea.width;

    leftArea.setSize(this.leftAreaWidth!);
    rightArea.setSize(this.rightAreaWidth!);
  }

  protected handleMouseDown(event: MouseEvent): void {
    event.preventDefault();

    this.active.set(true);
    this.eventX = event.clientX;

    const gutters = untracked(() => this.allGutters());

    if (!gutters.length) {
      return;
    }

    gutters.forEach((gutter) => gutter.updateSizes());
  }

  protected handleMouseMove(event: MouseEvent): void {
    const leftArea = untracked(() => this.leftArea());
    const rightArea = untracked(() => this.rightArea());
    if (
      this.eventX === undefined ||
      !leftArea ||
      !rightArea ||
      this.leftAreaWidth === undefined ||
      this.rightAreaWidth === undefined
    ) {
      return;
    }

    let delta = this.eventX - event.clientX;

    if (delta < -this.rightAreaWidth) {
      delta = -this.rightAreaWidth;
    }

    if (delta > this.leftAreaWidth) {
      delta = this.leftAreaWidth;
    }

    const leftAreaWidth = this.leftAreaWidth - delta;
    const rightAreaWidth = this.rightAreaWidth + delta;

    leftArea?.setSize?.(leftAreaWidth);
    rightArea?.setSize?.(rightAreaWidth);
  }

  protected handleMouseUp(): void {
    this.active.set(false);
    delete this.eventX;
    delete this.leftAreaWidth;
    delete this.rightAreaWidth;
  }
}
