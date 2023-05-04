import { Component, inject, ViewChild } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AugmentedParametersService,
  AutoDeselectStrategy,
  BulkOperationType,
  BulkOperationsInvokeService,
  FilterConditionFactoryService,
  Parameter,
  selectionCollectionProvider,
  TableSearch,
  RestoreDialogsService,
  tablePersistenceConfigProvider,
  STORE_ALL,
} from '@exense/step-core';
import { ParameterDialogsService } from '../../services/parameter-dialogs.service';
import { ParametersBulkOperationsInvokeService } from '../../services/parameters-bulk-operations-invoke.service';

@Component({
  selector: 'step-parameters-list',
  templateUrl: './parameters-list.component.html',
  styleUrls: ['./parameters-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('parametersList', STORE_ALL),
    selectionCollectionProvider<string, Parameter>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: BulkOperationsInvokeService,
      useClass: ParametersBulkOperationsInvokeService,
    },
  ],
})
export class ParametersListComponent {
  private _parametersService = inject(AugmentedParametersService);
  private _parameterDialogs = inject(ParameterDialogsService);
  private _restoreDialogsService = inject(RestoreDialogsService);
  readonly _filterConditionFactory = inject(FilterConditionFactoryService);

  readonly dataSource = this._parametersService.dataSource;
  readonly availableBulkOperations = [
    { operation: BulkOperationType.delete, permission: 'param-delete' },
    { operation: BulkOperationType.duplicate, permission: 'param-write' },
  ];

  importParameter(): void {
    this._parameterDialogs.importParameter().subscribe(() => this.dataSource.reload());
  }

  exportParameter(): void {
    this._parameterDialogs.exportParameter().subscribe(() => this.dataSource.reload());
  }

  duplicateParameter(parameter: Parameter): void {
    this._parametersService.cloneParameter(parameter.id!).subscribe(() => this.dataSource.reload());
  }

  editParameter(parameter: Parameter): void {
    this._parameterDialogs.editParameter(parameter).subscribe((savedParameter) => {
      if (savedParameter) {
        this.dataSource.reload();
      }
    });
  }

  createParameter(): void {
    this._parameterDialogs.editParameter().subscribe((savedParameter) => {
      if (savedParameter) {
        this.dataSource.reload();
      }
    });
  }

  deleteParameter(id: string, label: string): void {
    this._parameterDialogs.deleteParameter(id, label).subscribe((result: boolean) => {
      if (!result) {
        return;
      }

      this.dataSource.reload();
    });
  }
  displayHistory(parameter: Parameter, permission: string) {
    if (!parameter.id) {
      return;
    }

    const resourceVersion = parameter.customFields ? parameter.customFields['versionId'] : undefined;
    const versionHistory = this._parametersService.getParameterVersions(parameter.id!);

    this._restoreDialogsService
      .showRestoreDialog(resourceVersion, versionHistory, permission)
      .subscribe((restoreVersion) => {
        if (!restoreVersion) {
          return;
        }

        this._parametersService
          .restoreParameterVersion(parameter.id!, restoreVersion)
          .subscribe(() => this.dataSource.reload());
      });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepParametersList', downgradeComponent({ component: ParametersListComponent }));
