import { Component, Inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  a1Promise2Observable,
  AJS_FUNCTION_TYPE_REGISTRY,
  AJS_LOCATION,
  AJS_MODULE,
  AJS_ROOT_SCOPE,
  AugmentedKeywordsService,
  InteractivePlanExecutionService,
} from '@exense/step-core';
import { noop } from 'rxjs';
import { ILocationService, IRootScopeService } from 'angular';
import { FunctionDialogsService } from '../../services/function-dialogs.service';
import { FunctionPackageActionsService } from '../../services/function-package-actions.service';

@Component({
  selector: 'step-function-list',
  templateUrl: './function-list.component.html',
  styleUrls: ['./function-list.component.scss'],
})
export class FunctionListComponent {
  readonly dataSource = this._functionApiService.createFilteredTableDataSource();

  constructor(
    private _functionApiService: AugmentedKeywordsService,
    private _interactivePlanExecutionApiService: InteractivePlanExecutionService,
    private _functionDialogs: FunctionDialogsService,
    private _functionPackageDialogs: FunctionPackageActionsService,
    @Inject(AJS_ROOT_SCOPE) private _$rootScope: IRootScopeService,
    @Inject(AJS_LOCATION) private _location: ILocationService,
    @Inject(AJS_FUNCTION_TYPE_REGISTRY) private _functionTypeRegistry: any
  ) {}

  addFunction(): void {
    this._functionDialogs.openAddFunctionModal().subscribe(() => this.dataSource.reload());
  }

  addFunctionPackage(): void {
    this._functionPackageDialogs.openAddFunctionPackageDialog().subscribe(() => this.dataSource.reload());
  }

  editFunction(id: string): void {
    this._functionDialogs.openFunctionEditor(id);
  }

  executeFunction(id: string): void {
    this._interactivePlanExecutionApiService.startFunctionTestingSession(id).subscribe((result: any) => {
      (this._$rootScope as any).planEditorInitialState = {
        interactive: true,
        selectedNode: result.callFunctionId,
      };
      this._location.path('/root/plans/editor/' + result.planId);
    });
  }

  duplicateFunction(id: string): void {
    this._functionApiService.copyFunction(id).subscribe((_) => this.dataSource.reload());
  }

  deleteFunction(id: string, name: string): void {
    this._functionDialogs.openDeleteFunctionDialog(id, name).subscribe((result) => {
      if (result) {
        this.dataSource.reload();
      }
    });
  }

  exportFunction(id: string, name: string): void {
    this._functionDialogs.openExportFunctionDialog(id, name).subscribe((_) => this.dataSource.reload());
  }

  exportFunctions(): void {
    this._functionDialogs.openExportAllFunctionsDialog().subscribe((_) => this.dataSource.reload());
  }

  importFunctions(): void {
    this._functionDialogs.openImportFunctionDialog().subscribe((_) => this.dataSource.reload());
  }

  lookUp(id: string, name: string): void {
    this._functionDialogs.openLookUpFunctionDialog(id, name).subscribe(noop);
  }

  configureFunction(id: string) {
    this._functionDialogs.configureFunction(id).subscribe((_) => this.dataSource.reload());
  }

  functionTypeLabel(type: string) {
    return this._functionTypeRegistry.getLabel(type);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepFunctionList', downgradeComponent({ component: FunctionListComponent }));
