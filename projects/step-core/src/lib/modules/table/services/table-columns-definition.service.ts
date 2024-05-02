import { Injectable, OnDestroy, Signal } from '@angular/core';
import { ColumnDirective } from '../directives/column.directive';
import { Mutable } from '../../basics/types/mutable';
import { CustomColumnsScreenInputs } from '../components/custom-columns/custom-columns-screen-inputs';

type FieldAccessor = Mutable<Pick<TableColumnsDefinitionService, 'contentColumns' | 'customRemoteColumns'>>;

@Injectable()
export class TableColumnsDefinitionService implements OnDestroy {
  readonly contentColumns?: Signal<readonly ColumnDirective[]>;
  readonly customRemoteColumns?: Signal<CustomColumnsScreenInputs | undefined>;

  setup(
    contentColumns: Signal<readonly ColumnDirective[]>,
    customRemoteColumns: Signal<CustomColumnsScreenInputs | undefined>,
  ): void {
    (this as FieldAccessor).contentColumns = contentColumns;
    (this as FieldAccessor).customRemoteColumns = customRemoteColumns;
  }

  ngOnDestroy(): void {
    (this as FieldAccessor).contentColumns = undefined;
    (this as FieldAccessor).customRemoteColumns = undefined;
  }
}
