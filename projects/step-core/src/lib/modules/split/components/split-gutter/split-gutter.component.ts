import { AfterViewInit, Component, HostBinding, HostListener, inject } from '@angular/core';
import { SplitAreaComponent } from '../split-area/split-area.component';
import { SplitComponent } from '../split/split.component';

@Component({
  selector: 'step-split-gutter',
  templateUrl: './split-gutter.component.html',
  styleUrls: ['./split-gutter.component.scss'],
})
export class SplitGutterComponent implements AfterViewInit {
  private _splitComponent = inject(SplitComponent);
  private leftArea?: SplitAreaComponent;
  private rightArea?: SplitAreaComponent;
  private eventX?: number;
  private leftAreaWidth?: number;
  private rightAreaWidth?: number;

  @HostBinding('class.active')
  active?: boolean;

  ngAfterViewInit(): void {
    if (!this._splitComponent.areas || !this._splitComponent.gutters) {
      return;
    }

    const gutters = this._splitComponent.gutters.toArray();
    const areas = this._splitComponent.areas.toArray();
    const index = gutters.indexOf(this);

    this.leftArea = areas[index];
    this.rightArea = areas[index + 1];
  }

  setAreaWidths(): void {
    if (!this.leftArea || !this.rightArea) {
      return;
    }

    this.leftAreaWidth = this.leftArea.width;
    this.rightAreaWidth = this.rightArea.width;
  }

  setFlex(): void {
    this.leftArea?.setSize(this.leftAreaWidth!);
    this.rightArea?.setSize(this.rightAreaWidth!);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    event.preventDefault();

    this.active = true;
    this.eventX = event.clientX;

    if (!this._splitComponent.gutters) {
      return;
    }

    this._splitComponent.gutters.forEach((gutter) => {
      gutter.setAreaWidths();
    });
    this._splitComponent.gutters.forEach((gutter) => {
      gutter.setFlex();
    });
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (
      this.eventX === undefined ||
      !this.leftArea ||
      !this.rightArea ||
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

    this.leftArea?.setSize(leftAreaWidth);
    this.rightArea?.setSize(rightAreaWidth);
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    delete this.active;
    delete this.eventX;
    delete this.leftAreaWidth;
    delete this.rightAreaWidth;
  }
}
