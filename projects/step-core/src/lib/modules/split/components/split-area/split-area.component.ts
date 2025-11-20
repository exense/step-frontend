import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  signal,
  untracked,
} from '@angular/core';
import { debounceTime, map, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { SplitAreaSizePersistenceService } from '../../injectables/split-area-size-persistence.service';
import { SplitComponent } from '../split/split.component';

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
  private _splitComponent = inject(SplitComponent);
  private _splitAreaSizePersistenceService = inject(SplitAreaSizePersistenceService);

  private sizeUpdateInternal$ = new Subject<void>();

  private isViewInitialized = signal(false);

  readonly padding = input<string | undefined>(undefined);
  readonly sizeType = input<SplitAreaSizeType>('pixel');
  readonly sizePrefix = input.required<string>();

  private appliedPrefix = computed(() => {
    const splitPrefix = this._splitComponent.sizePrefix();
    const sizePrefix = this.sizePrefix();
    return `${splitPrefix}_${sizePrefix}`;
  });

  private splitAreaSizeController = computed(() => {
    const appliedPrefix = this.appliedPrefix();
    return this._splitAreaSizePersistenceService.createSplitAreaSizeController(appliedPrefix);
  });

  private sizeInternal = linkedSignal(() => {
    const sizeController = this.splitAreaSizeController();
    return sizeController.getSize();
  });

  readonly sizeUpdateDebounce = input(300);

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
    .subscribe((size) => {
      const sizeController = untracked(() => this.splitAreaSizeController());
      sizeController.setSize(size ?? 0);
    });

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
