import { inject, Pipe, PipeTransform } from '@angular/core';
import { ObjectUtilsService } from '../injectables/object-utils.service';

@Pipe({
  name: 'getObjectField',
  standalone: false,
})
export class GetObjectFieldPipe implements PipeTransform {
  private _objectUtils = inject(ObjectUtilsService);

  transform(object: object, fieldPath?: string): unknown {
    if (!fieldPath) {
      return object;
    }
    return this._objectUtils.getObjectFieldValue(object, fieldPath);
  }
}
