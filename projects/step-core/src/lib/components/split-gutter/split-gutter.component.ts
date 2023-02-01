import { AfterViewInit, Component, HostBinding, HostListener } from '@angular/core';
import { SplitAreaComponent } from '../split-area/split-area.component';
import { SplitComponent } from '../split/split.component';

@Component({
  selector: 'step-split-gutter',
  templateUrl: './split-gutter.component.html',
  styleUrls: ['./split-gutter.component.scss'],
})
export class SplitGutterComponent implements AfterViewInit {
  private leftArea?: SplitAreaComponent;
  private rightArea?: SplitAreaComponent;
  private eventX?: number;
  private leftAreaWidth?: number;
  private rightAreaWidth?: number;

  @HostBinding('class.active')
  active?: boolean;

  constructor(private splitComponent: SplitComponent) {}

  ngAfterViewInit(): void {
    if (!this.splitComponent.areas || !this.splitComponent.gutters) {
      return;
    }

    const gutters = this.splitComponent.gutters.toArray();
    const areas = this.splitComponent.areas.toArray();
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
    this.setLeftAreaFlex(this.leftAreaWidth!);
    this.setRightAreaFlex(this.rightAreaWidth!);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    event.preventDefault();

    this.active = true;
    this.eventX = event.clientX;

    if (!this.splitComponent.gutters) {
      return;
    }

    this.splitComponent.gutters.forEach((gutter) => {
      gutter.setAreaWidths();
    });
    this.splitComponent.gutters.forEach((gutter) => {
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

    this.setLeftAreaFlex(leftAreaWidth);
    this.setRightAreaFlex(rightAreaWidth);
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    delete this.active;
    delete this.eventX;
    delete this.leftAreaWidth;
    delete this.rightAreaWidth;
  }

  private setLeftAreaFlex(leftAreaWidth: number): void {
    if (!this.leftArea) {
      return;
    }

    this.leftArea.setFlex({
      flexBasis: `${leftAreaWidth}px`,
      ...(this.leftArea.sizeType === 'flex' ? { flexGrow: this.leftArea.size } : {}),
    });
  }

  private setRightAreaFlex(rightAreaWidth: number): void {
    if (!this.rightArea) {
      return;
    }

    this.rightArea.setFlex({
      flexBasis: `${rightAreaWidth}px`,
      ...(this.rightArea.sizeType === 'flex' ? { flexGrow: this.rightArea.size } : {}),
    });
  }
}
