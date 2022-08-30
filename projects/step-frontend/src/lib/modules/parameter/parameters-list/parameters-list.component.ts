import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Parameter, AugmentedParametersService } from '@exense/step-core';
import { ParameterDialogsService } from '../services/parameter-dialogs.service';

@Component({
  selector: 'step-parameters-list',
  templateUrl: './parameters-list.component.html',
  styleUrls: ['./parameters-list.component.scss'],
})
export class ParametersListComponent {
  readonly dataSource = this._parametersService.dataSource;

  constructor(
    private _parametersService: AugmentedParametersService,
    private _parameterDialogs: ParameterDialogsService
  ) {}

  importParameter(): void {
    this._parameterDialogs.importParameter().subscribe(() => this.dataSource.reload());
  }

  exportParameter(): void {
    this._parameterDialogs.exportParameter().subscribe(() => this.dataSource.reload());
  }

  duplicateParameter(parameter: Parameter): void {
    this._parametersService.copyParameter(parameter.id!).subscribe(() => this.dataSource.reload());
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
