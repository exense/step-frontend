import { Component, computed, effect, input, model, output, signal, ViewEncapsulation } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { StepPageEvent } from '../../types/step-page-event';

@Component({
  selector: 'step-paginator',
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class PaginatorComponent {
  readonly showPageSizeOptions = input(true);

  readonly pageSizeOptions = input([], {
    transform: (value?: number[] | null) => value ?? [],
  });

  protected areOptionsEditable = computed(() => this.pageSizeOptions().length > 1);

  protected effectSetSizeOptions = effect(() => {
    const options = this.pageSizeOptions();
    if (!this.pageSize()) {
      this.pageSize.set(options[0] ?? 0);
    }
  });

  readonly usePagesCount = input(true);
  readonly hasNext = input(false);

  readonly lengthInput = input(0, {
    alias: 'length',
    transform: (value: number | undefined | null) => value ?? 0,
  });

  // Synchronize input with signal value
  private effectLengthInput = effect(() => {
    this.length.set(this.lengthInput());
  });

  isPageDisabled = input(false, {
    alias: 'disabled',
    transform: (value: boolean | undefined | null) => !!value,
  });

  readonly length = signal(0);
  pageSize = model(0);
  readonly pageIndex = signal(0);

  readonly pageChange = output<StepPageEvent>();

  private pageEvent = computed<StepPageEvent>(() => {
    const pageIndex = this.pageIndex();
    const pageSize = this.pageSize();
    return {
      pageIndex,
      pageSize,
    };
  });

  private pageEventEffect = effect(() => {
    const pageEvent = this.pageEvent();
    this.pageChange.emit(pageEvent);
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
  protected canGoNext = computed(() => {
    const [usePagesCount, pageIndex, pagesCount, hasNext] = [
      this.usePagesCount(),
      this.pageIndex(),
      this.pagesCount(),
      this.hasNext(),
    ];
    if (usePagesCount) {
      return pageIndex < pagesCount - 1;
    }
    return hasNext;
  });

  protected pageLabel = computed(() => {
    const [pageIndex, pageSize, pagesCount, length, usePagesCount] = [
      this.pageIndex(),
      this.pageSize(),
      this.pagesCount(),
      this.length(),
      this.usePagesCount(),
    ];

    if (usePagesCount && !length) {
      return '';
    }

    const from = pageIndex * pageSize;
    let to = from + pageSize;

    if (usePagesCount && length > 0 && pageIndex >= pagesCount - 1) {
      to = length;
    }

    const total = usePagesCount && length > 0 ? `${length}` : 'many';

    if (pageSize === 1) {
      return `${to} of ${total}`;
    }
    return `${from + 1} - ${to} of ${total}`;
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
