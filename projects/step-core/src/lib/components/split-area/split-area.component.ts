import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';

type SplitAreaSizeType = 'pixel' | 'percent' | 'flex';

@Component({
  selector: 'step-split-area',
  templateUrl: './split-area.component.html',
  styleUrls: ['./split-area.component.scss'],
})
export class SplitAreaComponent implements AfterViewInit {
  @Input() sizeType?: SplitAreaSizeType;
  @Input() size?: string;
  @Input() padding?: string;

  constructor(private _elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    switch (this.sizeType) {
      case 'pixel':
        this.setFlex({
          flexBasis: `${this.size}px`,
        });

        break;

      case 'percent':
        this.setFlex({
          flexBasis: `${this.size}%`,
        });

        break;

      case 'flex':
        this.setFlex({
          flexGrow: this.size,
        });

        break;
    }
  }

  get width(): number {
    return this.boundingClientRect.width;
  }

  private get boundingClientRect(): DOMRect {
    return this._elementRef.nativeElement.getBoundingClientRect();
  }

  setFlex({
    flexBasis = '0',
    flexGrow = '0',
    flexShrink = '1',
  }: {
    flexBasis?: string;
    flexGrow?: string;
    flexShrink?: string;
  }): void {
    this._elementRef.nativeElement.style.setProperty('flex-basis', flexBasis || '');
    this._elementRef.nativeElement.style.setProperty('flex-grow', flexGrow || '');
    this._elementRef.nativeElement.style.setProperty('flex-shrink', flexShrink || '');
  }
}
