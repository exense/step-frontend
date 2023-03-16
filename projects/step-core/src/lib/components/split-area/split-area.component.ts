import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { debounceTime, Subject } from 'rxjs';

type SplitAreaSizeType = 'pixel' | 'percent' | 'flex';

@Component({
  selector: 'step-split-area',
  templateUrl: './split-area.component.html',
  styleUrls: ['./split-area.component.scss'],
})
export class SplitAreaComponent implements AfterViewInit, OnChanges, OnDestroy {
  private sizeUpdateInternal$?: Subject<void>;

  @Input() sizeUpdateDebounce: number = 300;
  @Input() sizeType?: SplitAreaSizeType;
  @Input() size?: string;
  @Input() padding?: string;

  @Output() sizeUpdate = new EventEmitter<void>();

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

      default:
        this.setFlex({
          flexBasis: `${this.width}px`,
        });

        break;
    }
    this.setupSizeUpdate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cSizeUpdateDebounce = changes['sizeUpdateDebounce'];
    if (cSizeUpdateDebounce?.previousValue !== cSizeUpdateDebounce?.currentValue || cSizeUpdateDebounce?.firstChange) {
      this.setupSizeUpdate(cSizeUpdateDebounce?.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.destroySizeUpdate();
  }

  get width(): number {
    return this.boundingClientRect.width;
  }

  private get boundingClientRect(): DOMRect {
    return this._elementRef.nativeElement.getBoundingClientRect();
  }

  @HostListener('focusin')
  onFocusIn(): void {
    this._elementRef.nativeElement.scrollTop = 0;
    this._elementRef.nativeElement.scrollLeft = 0;
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
    this.sizeUpdateInternal$?.next();
  }

  private destroySizeUpdate(): void {
    if (!this.sizeUpdateInternal$) {
      return;
    }
    this.sizeUpdateInternal$.complete();
    this.sizeUpdateInternal$ = undefined;
  }

  private setupSizeUpdate(sizeUpdateDebounce?: number): void {
    this.destroySizeUpdate();
    sizeUpdateDebounce = sizeUpdateDebounce || this.sizeUpdateDebounce;
    this.sizeUpdateInternal$ = new Subject<void>();
    this.sizeUpdateInternal$.pipe(debounceTime(sizeUpdateDebounce)).subscribe(() => this.sizeUpdate.emit());
  }
}
