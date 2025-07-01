import { effect, inject, Injectable, Injector, signal, Signal } from '@angular/core';
import { ColumnDirective } from '../directives/column.directive';
import { CustomColumnsScreenInputs } from '../components/custom-columns/custom-columns-screen-inputs';

@Injectable()
export class TableColumnsDefinitionService {
  private _injector = inject(Injector);

  private contentColumnsInternal = signal<readonly ColumnDirective[]>([]);
  private customRemoteColumnsInternal = signal<CustomColumnsScreenInputs | undefined>(undefined);

  readonly contentColumns = this.contentColumnsInternal.asReadonly();
  readonly customRemoteColumns = this.customRemoteColumnsInternal.asReadonly();

  setup(
    contentColumnsExternal: Signal<readonly ColumnDirective[]>,
    customRemoteColumnsExternal: Signal<CustomColumnsScreenInputs | undefined>,
  ): void {
    effect(
      () => {
        const contentCols = contentColumnsExternal();
        this.contentColumnsInternal.set(contentCols);
      },
      { injector: this._injector, allowSignalWrites: true },
    );

    effect(
      () => {
        const remoteCols = customRemoteColumnsExternal();
        this.customRemoteColumnsInternal.set(remoteCols);
      },
      { injector: this._injector, allowSignalWrites: true },
    );
  }
}
