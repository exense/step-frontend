import { Component, computed, inject, output, viewChild, ViewEncapsulation } from '@angular/core';
import {
  AugmentedPlansService,
  BulkSelectionType,
  EntitySelectionState,
  entitySelectionStateProvider,
  Plan,
  SelectionList,
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
    ...entitySelectionStateProvider<string, Plan>('id'),
    tableColumnsConfigProvider({
      entityTableRemoteId: 'planEditorOtherPlanTable',
      entityScreenId: 'plan',
      entityScreenDefaultVisibleFields: ['attributes.name'],
      customColumnOptions: ['noEditorLink', 'noDescriptionHint'],
    }),
  ],
  host: {
    class: 'plan-editor-control-selections',
  },
  standalone: false,
})
export class PlanOtherplanListComponent {
  private _selectionState = inject<EntitySelectionState<string, Plan>>(EntitySelectionState);
  private _tableApi = inject(TableApiWrapperService);

  protected readonly dataSource = inject(
    AugmentedPlansService,
  ).getPlansTableDataSource() as TableRemoteDataSource<Plan>;

  private selectionList = viewChild('selectionList', { read: SelectionList<string, Plan> });

  protected readonly hasSelection = computed(() => this._selectionState.selectedSize() > 0);

  readonly addPlans = output<string[]>();

  protected addPlan(id: string): void {
    this.addPlans.emit([id]);
  }

  protected addAllPlans(): void {
    of(this._selectionState.selectionType())
      .pipe(
        switchMap((selectionType) => {
          const isGetFromRemote =
            selectionType === BulkSelectionType.ALL || selectionType === BulkSelectionType.FILTERED;
          return isGetFromRemote
            ? this.requestPlanIdsWithoutPagination()
            : of(Array.from(this._selectionState.selectedKeys()));
        }),
        filter((ids) => !!ids.length),
      )
      .subscribe((ids) => {
        this.selectionList()?.clearSelection?.();
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
