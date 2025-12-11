import { Directive } from '@angular/core';
import { EntitySelectionState, EntitySelectionStateUpdatable } from '../../entities-selection';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'step-table[noSelectionState]',
  providers: [
    {
      provide: EntitySelectionState,
      useValue: null,
    },
    {
      provide: EntitySelectionStateUpdatable,
      useValue: null,
    },
  ],
})
export class TableWithoutSelectionStateDirective {}
