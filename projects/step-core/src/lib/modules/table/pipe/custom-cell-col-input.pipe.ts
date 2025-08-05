import { Pipe, PipeTransform } from '@angular/core';
import { ColInputExt } from '../types/col-input-ext';
import { Input as ColInput } from '../../../client/step-client-module';

@Pipe({
  name: 'customCellColInput',
  standalone: false,
})
export class CustomCellColInputPipe implements PipeTransform {
  transform(colInput: ColInput, entitySubPath?: string): ColInputExt {
    if (!colInput) {
      return colInput;
    }
    return { ...colInput, entitySubPath };
  }
}
