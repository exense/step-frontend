import { Component, Inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  a1Promise2Observable,
  AJS_LOCATION,
  AJS_MODULE,
  DialogsService,
  AugmentedPlansService,
  Plan,
  TableRemoteDataSource,
} from '@exense/step-core';
import { PlanDialogsService } from '../../servies/plan-dialogs.service';
import { ExportDialogsService } from '../../../_common/services/export-dialogs.service';
import { ImportDialogsService } from '../../../_common/services/import-dialogs.service';
import { IsUsedByDialogsService } from '../../../_common/services/is-used-by-dialogs.service';
import { IsUsedByType } from '../../../_common/shared/is-used-by-type.enum';
import { catchError, map, noop, of, switchMap, tap } from 'rxjs';
import { ILocationService } from 'angular';

@Component({
  selector: 'step-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.scss'],
})
export class PlanListComponent {
  readonly dataSource: TableRemoteDataSource<Plan>;

  constructor(
    private _augmentedPlansService: AugmentedPlansService,
    private _dialogs: DialogsService,
    private _planDialogs: PlanDialogsService,
    private _exportDialogs: ExportDialogsService,
    private _importDialogs: ImportDialogsService,
    private _isUsedByDialogs: IsUsedByDialogsService,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {
    this.dataSource = this._augmentedPlansService.getPlansTableDataSource();
  }

  addPlan(): void {
    this._planDialogs.createPlan().subscribe((_) => this.dataSource.reload());
  }

  editPlan(id: string): void {
    this._location.path(`/root/plans/editor/${id}`);
  }

  executePlan(id: string): void {
    this._location.path(`/root/repository`).search({ repositoryId: 'local', planid: id });
  }

  duplicatePlan(id: string): void {
    this._augmentedPlansService
      .clonePlan(id)
      .pipe(
        map((clone: Plan) => {
          clone['attributes']['name'] += '_Copy';
          return clone;
        }),
        switchMap((clone) => this._augmentedPlansService.save4(clone))
      )
      .subscribe((_) => this.dataSource.reload());
  }

  deletePlan(id: string, name: string): void {
    a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Plan "${name}"`))
      .pipe(
        map((_) => true),
        catchError((_) => of(false)),
        tap((isDeleteConfirmed) => console.log('IS DELETE CONFIRMED', isDeleteConfirmed)),
        switchMap((isDeleteConfirmed) =>
          isDeleteConfirmed ? this._augmentedPlansService.delete3(id).pipe(map((_) => true)) : of(false)
        )
      )
      .subscribe((result) => {
        if (result) {
          this.dataSource.reload();
        }
      });
  }

  importPlans(): void {
    this._importDialogs
      .displayImportDialog('Plans import', 'plans', true, false)
      .subscribe((_) => this.dataSource.reload());
  }

  exportPlans(): void {
    this._exportDialogs
      .displayExportDialog('Plans export', 'plans', 'allPlans.sta', true, false)
      .subscribe((_) => this.dataSource.reload());
  }

  exportPlan(id: string, name: string): void {
    this._exportDialogs.displayExportDialog('Plans export', `plans/${id}`, `${name}.sta`, true, false).subscribe(noop);
  }

  lookUp(id: string, name: string): void {
    this._isUsedByDialogs.displayDialog(`Plan "${name}" is used by`, IsUsedByType.PLAN_ID, id).subscribe(noop);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepPlanList', downgradeComponent({ component: PlanListComponent }));
