import { Component, forwardRef, inject } from '@angular/core';
import {
  AutoDeselectStrategy,
  Parameter,
  selectionCollectionProvider,
  tablePersistenceConfigProvider,
  STORE_ALL,
  DialogParentService,
} from '@exense/step-core';
import { ParameterListLogicService } from '../../services/parameter-list-logic.service';

@Component({
  selector: 'step-parameters-list',
  templateUrl: './parameters-list.component.html',
  styleUrls: ['./parameters-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('parametersList', STORE_ALL),
    ...selectionCollectionProvider<string, Parameter>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    ParameterListLogicService,
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => ParametersListComponent),
    },
  ],
})
export class ParametersListComponent implements DialogParentService {
  protected _logic = inject(ParameterListLogicService);

  readonly returnParentUrl = this._logic.ROOT_URL;

  dialogSuccessfullyClosed(): void {
    this._logic.dataSource.reload();
  }
}
