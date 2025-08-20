import { Directive } from '@angular/core';
import {
  EntitySelectionState,
  EntitySelectionStateUpdatable,
} from '../../entities-selection/entities-selection.module';

@Directive({
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
