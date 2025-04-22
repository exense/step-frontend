import { Component, inject, model, output, ViewEncapsulation } from '@angular/core';
import {
  AugmentedKeywordsService,
  AutoDeselectStrategy,
  BulkSelectionType,
  Keyword,
  selectionCollectionProvider,
  SelectionCollector,
  TableApiWrapperService,
  tableColumnsConfigProvider,
  TableRemoteDataSource,
} from '@exense/step-core';
import { catchError, filter, map, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'step-plan-function-list',
  templateUrl: './plan-function-list.component.html',
  styleUrls: ['./plan-function-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ...selectionCollectionProvider<string, Keyword>('id', AutoDeselectStrategy.KEEP_SELECTION),
    tableColumnsConfigProvider({
      entityTableRemoteId: 'planEditorFunctionTable',
      entityScreenId: 'keyword',
      entityScreenDefaultVisibleFields: ['attributes.name'],
      customColumnOptions: ['noEditorLink', 'noDescriptionHint'],
    }),
  ],
})
export class PlanFunctionListComponent {
  private _selectionCollector = inject<SelectionCollector<string, Keyword>>(SelectionCollector);
  private _tableApi = inject(TableApiWrapperService);
  readonly dataSource = inject(
    AugmentedKeywordsService,
  ).createFilteredTableDataSource() as TableRemoteDataSource<Keyword>;

  readonly hasSelection$ = this._selectionCollector.length$.pipe(map((length) => length > 0));

  readonly addKeywords = output<string[]>();

  protected selectionType = model<BulkSelectionType>(BulkSelectionType.NONE);

  protected addKeyword(id: string): void {
    this.addKeywords.emit([id]);
  }

  protected addSelectedKeywords(): void {
    of(this.selectionType())
      .pipe(
        switchMap((selectionType) => {
          const isGetFromRemote =
            selectionType === BulkSelectionType.ALL || selectionType === BulkSelectionType.FILTERED;
          return isGetFromRemote
            ? this.requestKeywordIdsWithoutPagination()
            : of([...this._selectionCollector.selected]);
        }),
        filter((ids) => !!ids.length),
      )
      .subscribe((ids) => {
        this._selectionCollector.clear();
        this.addKeywords.emit(ids);
      });
  }

  private requestKeywordIdsWithoutPagination(): Observable<string[]> {
    const tableId = this.dataSource.tableId;
    const request = this.dataSource.getCurrentRequest();
    if (!request) {
      return of([]);
    }
    request.skip = 0;
    request.limit = undefined;
    return this._tableApi.requestTable<Keyword>(tableId, request).pipe(
      map((data) => data?.data?.map((item) => item.id!)),
      catchError(() => of([])),
    );
  }
}
