import { Directive, forwardRef, input } from '@angular/core';
import { GridEditableService } from '../injectables/grid-editable.service';

@Directive({
  selector: '[stepGridEditable]',
  providers: [
    {
      provide: GridEditableService,
      useExisting: forwardRef(() => GridEditableDirective),
    },
  ],
})
export class GridEditableDirective implements GridEditableService {
  readonly editMode = input<boolean>(false);
}
