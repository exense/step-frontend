import { Component, computed, inject, signal } from '@angular/core';
import { SplitComponent } from '../split/split.component';

@Component({
  selector: 'step-split-gutter',
  templateUrl: './split-gutter.component.html',
  styleUrls: ['./split-gutter.component.scss'],
  host: {
    '[class.active]': 'isActive()',
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

  private areas = computed(() => this._splitComponent.areas());
  private gutters = computed(() => this._splitComponent.gutters());
  private index = computed(() => {
    const gutters = this.gutters();
    if (!gutters) {
      return -1;
    }
    return gutters.indexOf(this);
  });
  private leftArea = computed(() => {
    const areas = this.areas();
    const index = this.index();
    if (!areas || index < 0) {
      return undefined;
    }
    return areas[index];
  });
  private rightArea = computed(() => {
    const areas = this.areas();
    const index = this.index();
    if (!areas || index < 0) {
      return undefined;
    }
    return areas[index + 1];
  });

  protected isActive = signal(false);

  setAreaWidths(): void {
    const leftArea = this.leftArea();
    const rightArea = this.rightArea();
    if (!leftArea || !rightArea) {
      return;
    }

    this.leftAreaWidth = leftArea.width;
    this.rightAreaWidth = rightArea.width;
  }

  setFlex(): void {
    this.leftArea()?.setSize?.(this.leftAreaWidth!);
    this.rightArea()?.setSize?.(this.rightAreaWidth!);
  }

  protected handleMouseDown(event: MouseEvent): void {
    event.preventDefault();

    this.isActive.set(true);
    this.eventX = event.clientX;

    const gutters = this.gutters();
    if (!gutters) {
      return;
    }

    gutters.forEach((gutter) => {
      gutter.setAreaWidths();
    });
    gutters.forEach((gutter) => {
      gutter.setFlex();
    });
  }

  protected handleMouseMove(event: MouseEvent): void {
    const leftArea = this.leftArea();
    const rightArea = this.rightArea();
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

    this.leftArea()?.setSize?.(leftAreaWidth);
    this.rightArea()?.setSize?.(rightAreaWidth);
  }

  protected handleMouseUp(): void {
    this.isActive.set(false);
    delete this.eventX;
    delete this.leftAreaWidth;
    delete this.rightAreaWidth;
  }
}
