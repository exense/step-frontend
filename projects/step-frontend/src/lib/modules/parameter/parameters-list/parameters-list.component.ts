import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  ContextService,
  ParametersService,
  TableRestService,
  TableRemoteDataSource,
  Parameter,
} from '@exense/step-core';
import { ParameterDialogsService } from '../services/parameter-dialogs.service';

@Component({
  selector: 'step-parameters-list',
  templateUrl: './parameters-list.component.html',
  styleUrls: ['./parameters-list.component.scss'],
})
export class ParametersListComponent {
  readonly PARAMETER_TABLE_ID = 'parameters';

  readonly dataSource = new TableRemoteDataSource(this.PARAMETER_TABLE_ID, this._tableRest, {
    scope: 'scope',
    key: 'key',
    value: 'value',
    activationExpressionScript: 'activationExpression.script',
    priority: 'priority',
  });

  readonly currentUserName: string;

  constructor(
    private _parametersService: ParametersService,
    private _parameterDialogs: ParameterDialogsService,
    private _tableRest: TableRestService,
    context: ContextService
  ) {
    this.currentUserName = context.userName;
  }

  importParameter(): void {
    this._parameterDialogs.importParameter().subscribe(() => this.dataSource.reload());
  }

  exportParameter(): void {
    this._parameterDialogs.exportParameter().subscribe(() => this.dataSource.reload());
  }

  duplicateParameter(parameter: Parameter): void {
    this._parametersService.copy(parameter.id!).subscribe(() => this.dataSource.reload());
  }

  editParameter(parameter: Parameter): void {
    this._parameterDialogs.editParameter(parameter).subscribe(() => this.dataSource.reload());
  }

  createParameter(): void {
    this._parameterDialogs.editParameter().subscribe(() => this.dataSource.reload());
  }

  deleteParameter(id: string, label: string): void {
    this._parameterDialogs.deleteParameter(id, label).subscribe((result: boolean) => {
      if (result) {
        this.dataSource.reload();
      }
    });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepParametersList', downgradeComponent({ component: ParametersListComponent }));
