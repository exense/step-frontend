import {
  AfterViewInit,
  ElementRef,
  Component,
  effect,
  inject,
  input,
  output,
  OnDestroy,
  untracked,
  linkedSignal,
} from '@angular/core';
import { debounceTime, Subject } from 'rxjs';

type SplitAreaSizeType = 'pixel' | 'percent' | 'flex';

@Component({
  selector: 'step-split-area',
  templateUrl: './split-area.component.html',
  styleUrls: ['./split-area.component.scss'],
  host: {
    '(focusin)': 'handleFocusIn()',
  },
})
export class SplitAreaComponent implements AfterViewInit, OnDestroy {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private sizeUpdateInternal$?: Subject<void>;
  private isViewInitialized = false;

  readonly sizeUpdateDebounce = input(300);
  readonly sizeType = input<SplitAreaSizeType>('pixel');
  readonly sizeInput = input<number | undefined>(undefined, { alias: 'size' });
  readonly isFixedInput = input(false, { alias: 'isFixedInput' });

  private readonly size = linkedSignal(() => this.sizeInput());

  readonly padding = input<string | undefined>();
  readonly sizeChange = output<number>();

  get isFixed(): boolean {
    return untracked(() => this.isFixedInput());
  }

  private effectSizeUpdateDebounceChange = effect(() => {
    const sizeUpdateDebounce = this.sizeUpdateDebounce();
    this.setupSizeUpdate(sizeUpdateDebounce);
  });

  private effectSizeChange = effect(() => {
    const size = this.size();
    const sizeType = this.sizeType();
    this.changeSize(size, sizeType);
  });

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.changeSize();
    this.setupSizeUpdate();
  }

  ngOnDestroy(): void {
    this.destroySizeUpdate();
  }

  get width(): number {
    const boundingClientRect = this._elementRef.nativeElement.getBoundingClientRect();
    return boundingClientRect.width;
  }

  protected handleFocusIn(): void {
    this._elementRef.nativeElement.scrollTop = 0;
    this._elementRef.nativeElement.scrollLeft = 0;
  }

  setSize(size: number): void {
    this.size.set(size);
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
    sizeUpdateDebounce = sizeUpdateDebounce ?? untracked(() => this.sizeUpdateDebounce());
    this.sizeUpdateInternal$ = new Subject<void>();
    this.sizeUpdateInternal$.pipe(debounceTime(sizeUpdateDebounce)).subscribe(() => {
      const size = untracked(() => this.size()) ?? 0;
      this.sizeChange.emit(size);
    });
  }

  private changeSize(size?: number, sizeType?: SplitAreaSizeType): void {
    if (!this.isViewInitialized) {
      return;
    }
    size = size ?? untracked(() => this.size());
    sizeType = sizeType ?? untracked(() => this.sizeType());
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
    this.sizeUpdateInternal$?.next?.();
  }
}
