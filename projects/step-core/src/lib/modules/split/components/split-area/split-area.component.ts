import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
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
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private sizeUpdateInternal$?: Subject<void>;
  private isViewInitialized = false;

  @Input() sizeUpdateDebounce: number = 300;
  @Input() sizeType: SplitAreaSizeType = 'pixel';
  @Input() size?: number;
  @Input() padding?: string;

  @Output() sizeChange = new EventEmitter<number>();

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.changeSize();
    this.setupSizeUpdate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cSizeUpdateDebounce = changes['sizeUpdateDebounce'];
    if (cSizeUpdateDebounce?.previousValue !== cSizeUpdateDebounce?.currentValue || cSizeUpdateDebounce?.firstChange) {
      this.setupSizeUpdate(cSizeUpdateDebounce?.currentValue);
    }

    const cSizeType = changes['sizeType'];
    const cSize = changes['size'];

    let size: number | undefined;
    let sizeType: SplitAreaSizeType | undefined;

    if (cSize?.currentValue !== cSize?.previousValue || cSize?.firstChange) {
      size = cSize?.currentValue;
    }

    if (cSizeType?.currentValue !== cSizeType?.previousValue || cSizeType?.firstChange) {
      sizeType = cSizeType.currentValue;
    }

    if (size || sizeType) {
      this.changeSize(size, sizeType);
    }
  }

  ngOnDestroy(): void {
    this.destroySizeUpdate();
  }

  get width(): number {
    return this.boundingClientRect.width;
  }

  @HostListener('focusin')
  onFocusIn(): void {
    this._elementRef.nativeElement.scrollTop = 0;
    this._elementRef.nativeElement.scrollLeft = 0;
  }

  setSize(size: number): void {
    this.size = size;
    this.changeSize(size);
  }

  private get boundingClientRect(): DOMRect {
    return this._elementRef.nativeElement.getBoundingClientRect();
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
    this.sizeUpdateInternal$.pipe(debounceTime(sizeUpdateDebounce)).subscribe(() => this.sizeChange.emit(this.size));
  }

  private changeSize(size?: number, sizeType?: SplitAreaSizeType): void {
    if (!this.isViewInitialized) {
      return;
    }
    size = size ?? this.size;
    sizeType = sizeType ?? this.sizeType;
    switch (sizeType) {
      case 'percent':
        this.setFlex({
          flexBasis: `${size}%`,
        });
        break;

      case 'flex':
        this.setFlex({
          flexBasis: `${size}px`,
          flexGrow: '1',
        });
        break;

      default:
        this.setFlex({
          flexBasis: `${size ?? this.width}px`,
        });
        break;
    }
  }
  private setFlex({
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
}
