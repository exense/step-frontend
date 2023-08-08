import { Component, inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_LOCATION,
  AJS_MODULE,
  AJS_ROOT_SCOPE,
  AugmentedKeywordsService,
  AutoDeselectStrategy,
  BulkOperationType,
  BulkOperationsInvokeService,
  Function as KeywordFunction,
  InteractivePlanExecutionService,
  selectionCollectionProvider,
  tablePersistenceConfigProvider,
  STORE_ALL,
} from '@exense/step-core';
import { FunctionDialogsService } from '../../services/function-dialogs.service';
import { FunctionPackageActionsService } from '../../services/function-package-actions.service';
import { FunctionBulkOperationsInvokeService } from '../../services/function-bulk-operations-invoke.service';

@Component({
  selector: 'step-function-list',
  templateUrl: './function-list.component.html',
  styleUrls: ['./function-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('functionList', STORE_ALL),
    selectionCollectionProvider<string, KeywordFunction>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: BulkOperationsInvokeService,
      useClass: FunctionBulkOperationsInvokeService,
    },
  ],
})
export class FunctionListComponent {
  private _functionApiService = inject(AugmentedKeywordsService);
  private _interactivePlanExecutionApiService = inject(InteractivePlanExecutionService);
  private _functionDialogs = inject(FunctionDialogsService);
  private _functionPackageDialogs = inject(FunctionPackageActionsService);
  private _$rootScope = inject(AJS_ROOT_SCOPE);
  private _location = inject(AJS_LOCATION);

  readonly dataSource = this._functionApiService.createFilteredTableDataSource();
  readonly availableBulkOperations = [
    { operation: BulkOperationType.delete, permission: 'kw-delete' },
    { operation: BulkOperationType.duplicate, permission: 'kw-write' },
  ];

  addFunction(): void {
    this._functionDialogs.openAddFunctionModal().subscribe(() => this.dataSource.reload());
  }

  addFunctionPackage(): void {
    this._functionPackageDialogs.openAddFunctionPackageDialog().subscribe((result) => {
      if (result) {
        this.dataSource.reload();
      }
    });
  }

  editFunction(keyword: KeywordFunction): void {
    this._functionDialogs.openFunctionEditor(keyword).subscribe();
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
    this._functionApiService.cloneFunction(id).subscribe(() => this.dataSource.reload());
  }

  deleteFunction(id: string, name: string): void {
    this._functionDialogs.openDeleteFunctionDialog(id, name).subscribe((result) => {
      if (result) {
        this.dataSource.reload();
      }
    });
  }

  exportFunction(id: string, name: string): void {
    this._functionDialogs.openExportFunctionDialog(id, name).subscribe(() => this.dataSource.reload());
  }

  exportFunctions(): void {
    this._functionDialogs.openExportAllFunctionsDialog().subscribe(() => this.dataSource.reload());
  }

  importFunctions(): void {
    this._functionDialogs.openImportFunctionDialog().subscribe(() => this.dataSource.reload());
  }

  lookUp(id: string, name: string): void {
    this._functionDialogs.openLookUpFunctionDialog(id, name);
  }

  configureFunction(id: string): void {
    this._functionDialogs.configureFunction(id).subscribe(() => this.dataSource.reload());
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepFunctionList', downgradeComponent({ component: FunctionListComponent }));
