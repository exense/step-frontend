import { Component, inject, model, output, ViewEncapsulation } from '@angular/core';
import {
  AugmentedPlansService,
  AutoDeselectStrategy,
  BulkSelectionType,
  Plan,
  selectionCollectionProvider,
  SelectionCollector,
  TableApiWrapperService,
  tableColumnsConfigProvider,
  TableRemoteDataSource,
} from '@exense/step-core';
import { catchError, filter, map, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'step-plan-otherplan-list',
  templateUrl: './plan-otherplan-list.component.html',
  styleUrls: ['./plan-otherplan-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ...selectionCollectionProvider<string, Plan>('id', AutoDeselectStrategy.KEEP_SELECTION),
    tableColumnsConfigProvider({
      entityTableRemoteId: 'planEditorOtherPlanTable',
      entityScreenId: 'plan',
      entityScreenDefaultVisibleFields: ['attributes.name'],
      customColumnOptions: ['noEditorLink', 'noDescriptionHint'],
    }),
  ],
})
export class PlanOtherplanListComponent {
  private _selectionCollector = inject<SelectionCollector<string, Plan>>(SelectionCollector);
  private _tableApi = inject(TableApiWrapperService);

  readonly dataSource = inject(AugmentedPlansService).getPlansTableDataSource() as TableRemoteDataSource<Plan>;

  readonly hasSelection$ = this._selectionCollector.length$.pipe(map((length) => length > 0));

  readonly addPlans = output<string[]>();

  protected selectionType = model<BulkSelectionType>(BulkSelectionType.NONE);

  protected addPlan(id: string): void {
    this.addPlans.emit([id]);
  }

  protected addAllPlans(): void {
    of(this.selectionType())
      .pipe(
        switchMap((selectionType) => {
          const isGetFromRemote =
            selectionType === BulkSelectionType.ALL || selectionType === BulkSelectionType.FILTERED;
          return isGetFromRemote ? this.requestPlanIdsWithoutPagination() : of([...this._selectionCollector.selected]);
        }),
        filter((ids) => !!ids.length),
      )
      .subscribe((ids) => {
        this._selectionCollector.clear();
        this.addPlans.emit(ids);
      });
  }

  private requestPlanIdsWithoutPagination(): Observable<string[]> {
    const tableId = this.dataSource.tableId;
    const request = this.dataSource.getCurrentRequest();
    if (!request) {
      return of([]);
    }
    request.skip = 0;
    request.limit = undefined;
    return this._tableApi.requestTable<Plan>(tableId, request).pipe(
      map((data) => data?.data?.map((item) => item.id!)),
      catchError(() => of([])),
    );
  }
}
