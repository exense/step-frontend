import { inject, Injectable } from '@angular/core';
import {
  AugmentedParametersService,
  DialogsService,
  FilterConditionFactoryService,
  MultipleProjectsService,
  Parameter,
} from '@exense/step-core';
import { filter, switchMap } from 'rxjs';
import { Router } from '@angular/router';

const ROOT_URL = '/root/parameters';

@Injectable()
export class ParameterListLogicService {
  private _router = inject(Router);
  private _multipleProject = inject(MultipleProjectsService);
  private _dialogs = inject(DialogsService);
  private _parametersService = inject(AugmentedParametersService);

  readonly _filterConditionFactory = inject(FilterConditionFactoryService);

  readonly dataSource = this._parametersService.createDataSource();

  readonly ROOT_URL = ROOT_URL;

  importParameter(): void {
    this._router.navigateByUrl(`${ROOT_URL}/import`);
  }

  exportParameter(): void {
    this._router.navigateByUrl(`${ROOT_URL}/export`);
  }

  duplicateParameter(parameter: Parameter): void {
    this._parametersService.cloneParameter(parameter.id!).subscribe(() => this.dataSource.reload());
  }

  editParameter(parameter: Parameter): void {
    if (this._multipleProject.isEntityBelongsToCurrentProject(parameter)) {
      this.editParameterInternal(parameter.id!);
      return;
    }

    const url = `${ROOT_URL}/editor/${parameter.id!}`;

    this._multipleProject.confirmEntityEditInASeparateProject(parameter, url, 'parameter').subscribe((continueEdit) => {
      if (continueEdit) {
        this.editParameterInternal(parameter.id!);
      }
    });
  }

  createParameter(): void {
    this._router.navigateByUrl(`${ROOT_URL}/editor`);
  }

  deleteParameter(id: string, label: string): void {
    this._dialogs
      .showDeleteWarning(1, `Parameter "${label}"`)
      .pipe(
        filter((result) => result),
        switchMap(() => this._parametersService.deleteParameter(id)),
      )
      .subscribe((result: boolean) => {
        this.dataSource.reload();
      });
  }

  private editParameterInternal(parameterId: string): void {
    this._router.navigateByUrl(`${ROOT_URL}/editor/${parameterId}`);
  }
}
