import { AfterViewInit, Component, inject } from '@angular/core';
import {
  AutoDeselectStrategy,
  Parameter,
  selectionCollectionProvider,
  tablePersistenceConfigProvider,
  STORE_ALL,
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
  ],
})
export class ParametersListComponent implements AfterViewInit {
  protected _logic = inject(ParameterListLogicService);

  ngAfterViewInit(): void {
    this._logic.resolveEditLinkIfExists();
  }
}
