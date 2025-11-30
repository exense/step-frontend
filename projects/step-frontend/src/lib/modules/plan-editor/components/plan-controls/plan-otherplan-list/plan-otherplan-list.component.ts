import { Component, computed, effect, inject, output, viewChild, ViewEncapsulation } from '@angular/core';
import {
  AugmentedPlansService,
  BulkSelectionType,
  EntitySelectionState,
  entitySelectionStateProvider,
  Plan,
  PlanEditorService,
  SelectionList,
  StepCoreModule,
  TableApiWrapperService,
  tableColumnsConfigProvider,
  TableRemoteDataSource,
} from '@exense/step-core';
import { catchError, filter, map, Observable, of, switchMap } from 'rxjs';
import { PlanNodesDragPreviewComponent } from '../../plan-nodes-drag-preview/plan-nodes-drag-preview.component';
import { PlanDropInfoPipe } from './plan-drop-info.pipe';
import { createActivatableEntitiesTableParams } from '../../../injectables/activatable-entities-table-params';

@Component({
  selector: 'step-plan-otherplan-list',
  templateUrl: './plan-otherplan-list.component.html',
  styleUrls: ['./plan-otherplan-list.component.scss'],
  imports: [StepCoreModule, PlanNodesDragPreviewComponent, PlanDropInfoPipe],
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
})
export class PlanOtherplanListComponent {
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

  protected readonly hasSelection = computed(() => this._selectionState.selectedSize() > 0);
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
