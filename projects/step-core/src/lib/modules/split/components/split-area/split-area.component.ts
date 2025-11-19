import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { debounceTime, map, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

export type SplitAreaSizeType = 'pixel' | 'percent' | 'flex';

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
  private sizeUpdateInternal$ = new Subject<void>();

  private isViewInitialized = signal(false);

  readonly padding = input<string | undefined>(undefined);
  readonly sizeType = input<SplitAreaSizeType>('pixel');
  readonly size = input<number | undefined>(undefined);

  private sizeInternal = linkedSignal(() => this.size());

  readonly sizeUpdateDebounce = input(300);

  readonly sizeChange = output<number | undefined>();

  private effectUpdateSize = effect(() => {
    const isViewInitialized = this.isViewInitialized();
    const sizeType = this.sizeType();
    const size = this.sizeInternal();

    if (!isViewInitialized) {
      return;
    }

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
  });

  private sizeUpdateDebounce$ = toObservable(this.sizeUpdateDebounce);

  private sizeDebounceSubscription = this.sizeUpdateDebounce$
    .pipe(
      switchMap((debounceValue) => this.sizeUpdateInternal$.pipe(debounceTime(debounceValue))),
      map(() => this.sizeInternal()),
      takeUntilDestroyed(),
    )
    .subscribe((size) => this.sizeChange.emit(size));

  ngAfterViewInit(): void {
    this.isViewInitialized.set(true);
  }

  ngOnDestroy(): void {
    this.sizeUpdateInternal$.complete();
  }

  get width(): number {
    return this.boundingClientRect.width;
  }

  setSize(size: number): void {
    this.sizeInternal.set(size);
  }

  protected handleFocusIn(): void {
    this._elementRef.nativeElement.scrollTop = 0;
    this._elementRef.nativeElement.scrollLeft = 0;
  }

  private get boundingClientRect(): DOMRect {
    return this._elementRef.nativeElement.getBoundingClientRect();
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
    this._elementRef?.nativeElement?.style?.setProperty?.('flex-basis', flexBasis || '');
    this._elementRef?.nativeElement?.style?.setProperty?.('flex-grow', flexGrow || '');
    this._elementRef?.nativeElement?.style?.setProperty?.('flex-shrink', flexShrink || '');
    this.sizeUpdateInternal$.next();
  }
}
