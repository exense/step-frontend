import { inject, Injectable } from '@angular/core';
import {
  AugmentedParametersService,
  EditorResolverService,
  FilterConditionFactoryService,
  MultipleProjectsService,
  Parameter,
  RestoreDialogsService,
} from '@exense/step-core';
import { ParameterDialogsService } from './parameter-dialogs.service';
import { take } from 'rxjs';

const PARAMETER_ID = 'parameterId';

@Injectable()
export class ParameterListLogicService {
  private _multipleProject = inject(MultipleProjectsService);
  private _editorResolver = inject(EditorResolverService);
  private _parametersService = inject(AugmentedParametersService);
  private _parameterDialogs = inject(ParameterDialogsService);
  private _restoreDialogsService = inject(RestoreDialogsService);

  readonly _filterConditionFactory = inject(FilterConditionFactoryService);

  readonly dataSource = this._parametersService.createDataSource();

  importParameter(): void {
    this._parameterDialogs.importParameter().subscribe((result) => {
      if (result) {
        this.dataSource.reload();
      }
    });
  }

  exportParameter(): void {
    this._parameterDialogs.exportParameter().subscribe();
  }

  duplicateParameter(parameter: Parameter): void {
    this._parametersService.cloneParameter(parameter.id!).subscribe(() => this.dataSource.reload());
  }

  editParameter(parameter: Parameter): void {
    if (this._multipleProject.isEntityBelongsToCurrentProject(parameter)) {
      this.editParameterInternal(parameter.id!);
      return;
    }

    const url = '/root/parameters';
    const editParams = { [PARAMETER_ID]: parameter.id! };

    this._multipleProject
      .confirmEntityEditInASeparateProject(parameter, { url, search: editParams }, 'parameter')
      .subscribe((continueEdit) => {
        if (continueEdit) {
          this.editParameterInternal(parameter.id!);
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
  displayHistory(parameter: Parameter, permission: string): void {
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

  resolveEditLinkIfExists(): void {
    this._editorResolver
      .onEditEntity(PARAMETER_ID)
      .pipe(take(1))
      .subscribe((parameterId) => this.editParameterInternal(parameterId));
  }

  private editParameterInternal(parameterId: string): void {
    this._parameterDialogs.editParameter(parameterId).subscribe((savedParameter) => {
      if (savedParameter) {
        this.dataSource.reload();
      }
    });
  }
}
