import { AfterViewInit, Component, inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AutoDeselectStrategy,
  BulkOperationType,
  BulkOperationsInvokeService,
  Parameter,
  selectionCollectionProvider,
  tablePersistenceConfigProvider,
  STORE_ALL,
} from '@exense/step-core';
import { ParametersBulkOperationsInvokeService } from '../../services/parameters-bulk-operations-invoke.service';
import { ParameterListLogicService } from '../../services/parameter-list-logic.service';

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
    ParameterListLogicService,
  ],
})
export class ParametersListComponent implements AfterViewInit {
  protected _logic = inject(ParameterListLogicService);

  readonly availableBulkOperations = [
    { operation: BulkOperationType.delete, permission: 'param-delete' },
    { operation: BulkOperationType.duplicate, permission: 'param-write' },
  ];

  ngAfterViewInit(): void {
    this._logic.resolveEditLinkIfExists();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepParametersList', downgradeComponent({ component: ParametersListComponent }));
