import { Injectable, OnDestroy, Signal } from '@angular/core';
import { ColumnDirective } from '../directives/column.directive';
import { CustomColumnsComponent } from '../components/custom-columns/custom-columns.component';
import { Mutable } from '../../basics/types/mutable';

type FieldAccessor = Mutable<Pick<TableColumnsDefinitionService, 'contentColumns' | 'customRemoteColumns'>>;

@Injectable()
export class TableColumnsDefinitionService implements OnDestroy {
  readonly contentColumns?: Signal<readonly ColumnDirective[]>;
  readonly customRemoteColumns?: Signal<CustomColumnsComponent | undefined>;

  setup(
    contentColumns: Signal<readonly ColumnDirective[]>,
    customRemoteColumns: Signal<CustomColumnsComponent | undefined>,
  ): void {
    (this as FieldAccessor).contentColumns = contentColumns;
    (this as FieldAccessor).customRemoteColumns = customRemoteColumns;
  }

  ngOnDestroy(): void {
    (this as FieldAccessor).contentColumns = undefined;
    (this as FieldAccessor).customRemoteColumns = undefined;
  }
}
