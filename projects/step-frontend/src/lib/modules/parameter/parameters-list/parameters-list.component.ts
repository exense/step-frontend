import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  DialogsService,
  IsUsedByDialogsService,
  AuthService,
  a1Promise2Observable,
  ContextService,
  Mutable,
  ParametersService,
  TableRestService,
  TableRemoteDataSource,
  Parameter,
} from '@exense/step-core';
import { switchMap, of, catchError, map } from 'rxjs';
import { ParameterDialogsService } from '../services/parameter-dialogs.service';
import { Location } from '@angular/common';
import { ImportDialogsService } from '../../_common/services/import-dialogs.service';
import { ExportDialogsService } from '../../_common/services/export-dialogs.service';

type InProgress = Mutable<Pick<ParametersListComponent, 'inProgress'>>;

@Component({
  selector: 'step-parameters-list',
  templateUrl: './parameters-list.component.html',
  styleUrls: ['./parameters-list.component.scss'],
})
export class ParametersListComponent {
  readonly PARAMETER_TABLE_ID = 'parameters';
  readonly PARAMETER_SEARCH_TYPE = 'PARAMETER_ID';

  readonly dataSource = new TableRemoteDataSource(this.PARAMETER_TABLE_ID, this._tableRest, {
    scope: 'scope',
    key: 'key',
    value: 'value',
    activationExpressionScript: 'activationExpression.script',
    priority: 'priority',
  });

  readonly currentUserName: string;
  readonly inProgress: boolean = false;

  constructor(
    private _parametersService: ParametersService,
    private _dialogs: DialogsService,
    private _parameterDialogs: ParameterDialogsService,
    private _isUsedByDialogs: IsUsedByDialogsService,
    private _importDialogs: ImportDialogsService,
    private _exportDialogs: ExportDialogsService,
    private _auth: AuthService,
    private _tableRest: TableRestService,
    public _location: Location,
    context: ContextService
  ) {
    this.currentUserName = context.userName;
  }

  importParameter(): void {
    this._importDialogs
      .displayImportDialog('Parameters import', 'parameters', true, false)
      .subscribe((_) => this.dataSource.reload());
  }

  exportParameter(): void {
    this._exportDialogs
      .displayExportDialog('Parameters export', 'parameters', 'allParameters.sta', true, false)
      .subscribe((_) => this.dataSource.reload());
  }

  duplicateParameter(parameter: Parameter): void {
    this._parametersService.copy(parameter.id!).subscribe((_) => this.dataSource.reload());
  }

  editParameter(parameter: Parameter): void {
    this._parameterDialogs.editParameter(parameter).subscribe((_) => this.dataSource.reload());
  }

  createParameter(): void {
    this._parameterDialogs.editParameter().subscribe((_) => this.dataSource.reload());
  }

  deleteParameter(id: string, label: string): void {
    a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Parameter "${label}"`))
      .pipe(
        switchMap((_) => this._parametersService.delete5(id)),
        map((_) => true),
        catchError((_) => of(false))
      )
      .subscribe((result: boolean) => {
        if (result) {
          this.dataSource.reload();
        }
      });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepParametersList', downgradeComponent({ component: ParametersListComponent }));
