import { Component, computed, effect, input, model, signal, untracked, ViewEncapsulation } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-paginator',
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PaginatorComponent {
  /** @Input() **/
  pageSizeOptions = input([], {
    transform: (value?: number[] | null) => value ?? [],
  });

  protected effectSetSizeOptions = effect(
    () => {
      const options = this.pageSizeOptions();
      if (!this.pageSize()) {
        this.pageSize.set(options[0] ?? 0);
      }
    },
    { allowSignalWrites: true },
  );

  /** @Input() **/
  lengthInput = input(0, {
    alias: 'length',
    transform: (value: number | undefined | null) => value ?? 0,
  });

  // Synchronize input with signal value
  private effectLengthInput = effect(
    () => {
      if (!this.length()) {
        this.length.set(this.lengthInput());
      }
    },
    { allowSignalWrites: true },
  );

  /** @Input() **/
  isPageDisabled = input(false, {
    alias: 'disabled',
    transform: (value: boolean | undefined | null) => !!value,
  });

  readonly length = signal(0);
  pageSize = model(0);
  readonly pageIndex = signal(0);

  private pageEvent = computed<PageEvent>(() => {
    const pageIndex = this.pageIndex();
    const pageSize = this.pageSize();
    const length = untracked(() => this.length());
    return {
      pageIndex,
      pageSize,
      length,
    };
  });

  readonly page$ = toObservable(this.pageEvent);

  private pagesCount = computed(() => {
    const length = this.length();
    const pageSize = this.pageSize();
    if (pageSize <= 0) {
      return 0;
    }
    let result = Math.floor(length / pageSize);
    if (length % pageSize !== 0) {
      result++;
    }
    return result;
  });

  protected canGoPrev = computed(() => this.pageIndex() > 0);
  protected canGoNext = computed(() => this.pageIndex() < this.pagesCount() - 1);

  protected pageLabel = computed(() => {
    const [pageIndex, pageSize, pagesCount, length] = [
      this.pageIndex(),
      this.pageSize(),
      this.pagesCount(),
      this.length(),
    ];

    if (!length) {
      return '';
    }

    const from = pageIndex * pageSize + 1;
    const to = pageIndex < pagesCount - 1 ? from + pageSize : length;
    return `${from} - ${to} of ${length}`;
  });

  next(): void {
    if (!this.canGoNext()) {
      return;
    }
    this.pageIndex.update((index) => index + 1);
  }

  prev(): void {
    if (!this.canGoPrev()) {
      return;
    }
    this.pageIndex.update((index) => index - 1);
  }

  firstPage(): void {
    this.pageIndex.set(0);
  }
}
