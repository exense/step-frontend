import { Component, computed, inject, output, viewChild, ViewEncapsulation } from '@angular/core';
import {
  AugmentedKeywordsService,
  BulkSelectionType,
  EntitySelectionState,
  entitySelectionStateProvider,
  Keyword,
  SelectionList,
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
    ...entitySelectionStateProvider<string, Keyword>('id'),
    tableColumnsConfigProvider({
      entityTableRemoteId: 'planEditorFunctionTable',
      entityScreenId: 'keyword',
      entityScreenDefaultVisibleFields: ['attributes.name'],
      customColumnOptions: ['noEditorLink', 'noDescriptionHint'],
    }),
  ],
  host: {
    class: 'plan-editor-control-selections',
  },
  standalone: false,
})
export class PlanFunctionListComponent {
  private _selectionState = inject<EntitySelectionState<string, Keyword>>(EntitySelectionState);
  private _tableApi = inject(TableApiWrapperService);
  readonly dataSource = inject(
    AugmentedKeywordsService,
  ).createFilteredTableDataSource() as TableRemoteDataSource<Keyword>;

  private selectionList = viewChild('selectionList', { read: SelectionList<string, Keyword> });

  protected readonly hasSelection = computed(() => this._selectionState.selectedSize() > 0);

  readonly addKeywords = output<string[]>();

  protected addKeyword(id: string): void {
    this.addKeywords.emit([id]);
  }

  protected addSelectedKeywords(): void {
    of(this._selectionState.selectionType())
      .pipe(
        switchMap((selectionType) => {
          const isGetFromRemote =
            selectionType === BulkSelectionType.ALL || selectionType === BulkSelectionType.FILTERED;
          return isGetFromRemote
            ? this.requestKeywordIdsWithoutPagination()
            : of(Array.from(this._selectionState.selectedKeys()));
        }),
        filter((ids) => !!ids.length),
      )
      .subscribe((ids) => {
        this.selectionList()?.clearSelection?.();
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
