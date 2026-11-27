import { Component, computed, effect, inject, input, output, viewChild, ViewEncapsulation } from '@angular/core';
import {
  AugmentedPlansService,
  BulkSelectionType,
  EntitySelectionState,
  entitySelectionStateProvider,
  Plan,
  PlanEditorService,
  SelectionList,
  TableApiWrapperService,
  tableColumnsConfigProvider,
  TableRemoteDataSource,
} from '@exense/step-core';
import { catchError, filter, map, Observable, of, switchMap } from 'rxjs';
import { createActivatableEntitiesTableParams } from '../../injectables/activatable-entities-table-params';

@Component({
  selector: 'step-plan-otherplan-list',
  templateUrl: './plan-otherplan-list.component.html',
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
  readonly insertTargetName = input<string>();
  private _selectionState = inject<EntitySelectionState<string, Plan>>(EntitySelectionState);
  private _tableApi = inject(TableApiWrapperService);
  private _planEditorService = inject(PlanEditorService);

  private reloadTargetExecutionParametersEffect = effect(() => {
    this._planEditorService.targetExecutionParameters();
    this.dataSource.reload({ immediateHideProgress: true });
  });

  protected readonly dataSource = inject(
    AugmentedPlansService,
  ).getPlansTableDataSource() as TableRemoteDataSource<Plan>;

  private selectionList = viewChild('selectionList', { read: SelectionList<string, Plan> });

  protected readonly currentPlanId = computed(() => this._planEditorService.plan().id);
  protected readonly activatableEntitiesTableParams = computed(() =>
    createActivatableEntitiesTableParams(this._planEditorService.targetExecutionParameters()),
  );

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
    const request =
      this._selectionState.selectionType() === BulkSelectionType.ALL
        ? this.dataSource.getFilterRequest({ params: this.activatableEntitiesTableParams() })
        : this.dataSource.getCurrentRequest();
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
