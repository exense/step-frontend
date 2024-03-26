import { Component, forwardRef, inject } from '@angular/core';
import {
  AutoDeselectStrategy,
  Parameter,
  selectionCollectionProvider,
  tablePersistenceConfigProvider,
  STORE_ALL,
  DialogParentService,
  DialogsService,
  AugmentedParametersService,
  FilterConditionFactoryService,
} from '@exense/step-core';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'step-parameters-list',
  templateUrl: './parameters-list.component.html',
  styleUrls: ['./parameters-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('parametersList', STORE_ALL),
    ...selectionCollectionProvider<string, Parameter>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => ParametersListComponent),
    },
  ],
})
export class ParametersListComponent implements DialogParentService {
  private _dialogs = inject(DialogsService);
  private _parametersService = inject(AugmentedParametersService);

  readonly _filterConditionFactory = inject(FilterConditionFactoryService);

  readonly returnParentUrl = '/parameters';

  readonly dataSource = this._parametersService.createDataSource();

  duplicateParameter(parameter: Parameter): void {
    this._parametersService.cloneParameter(parameter.id!).subscribe(() => this.dataSource.reload());
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

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
  }
}
