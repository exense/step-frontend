import { Directive, inject, OnDestroy, signal, contentChild, input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { PaginatorComponent } from '../components/paginator/paginator.component';
import { ItemsPerPageDefaultService } from '../services/items-per-page-default.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Observable, of, startWith, switchMap } from 'rxjs';
import { TablePersistenceStateService } from '../services/table-persistence-state.service';
import { ItemsPerPageService } from '../services/items-per-page.service';
import { StepPageEvent } from '../types/step-page-event';
import { TablePaginatorPrefixDirective } from './table-paginator-prefix.directive';
import { TablePaginatorContentDirective } from './table-paginator-content.directive';

@Directive({
  selector: '[stepTablePartPagination]',
})
export class TablePartPaginationDirective implements OnDestroy {
  private _tableState = inject(TablePersistenceStateService);

  private _itemsPerPageService = inject(ItemsPerPageService, { optional: true }) ?? inject(ItemsPerPageDefaultService);
  readonly pageSizeInputDisabled = input(false);

  readonly pageSizeOptions = toSignal(this._itemsPerPageService.getItemsPerPage(), { initialValue: [] });
  private readonly paginatorReadyInternal = signal(false);
  readonly paginatorReady = this.paginatorReadyInternal.asReadonly();

  private page: PaginatorComponent | undefined;

  readonly tablePaginatorPrefix = contentChild(TablePaginatorPrefixDirective);
  readonly tablePaginatorContent = contentChild(TablePaginatorContentDirective);

  get isPaginatorReady(): boolean {
    return !!this.page;
  }

  ngOnDestroy(): void {
    this.page = undefined;
    this.paginatorReadyInternal.set(false);
  }

  initializePaginator(paginator: PaginatorComponent): void {
    this.page = paginator;
    this.paginatorReadyInternal.set(!!paginator);
  }

  setupPageStream(): Observable<StepPageEvent> {
    let initialPage$: Observable<StepPageEvent>;

    const statePage = this._tableState.getPage();
    if (statePage) {
      this.page?.pageSize?.set?.(statePage.pageSize);
      this.page?.pageIndex?.set?.(statePage.pageIndex);
      initialPage$ = of(statePage);
    } else {
      this.page?.firstPage?.();
      initialPage$ = this._itemsPerPageService
        .getDefaultPageSizeItem()
        .pipe(map((pageSize) => this.createPageInitialValue(pageSize)));
    }

    if (!this.page) {
      return initialPage$;
    }

    return initialPage$.pipe(switchMap((initialPage) => this.page!.page$.pipe(startWith(initialPage))));
  }

  resetToFirstPage(): StepPageEvent {
    this.page?.firstPage?.();
    return this.createPageInitialValue();
  }

  private createPageInitialValue(pageSize?: number): PageEvent {
    pageSize = pageSize ?? (this.page?.pageSize?.() || this.pageSizeOptions()[0]);
    return {
      pageSize,
      pageIndex: 0,
      length: 0,
    };
  }
}
