import { inject, Pipe, PipeTransform } from '@angular/core';
import { Input as StInput } from '../../../client/step-client-module';
import { ObjectUtilsService } from '../../basics/step-basics.module';

@Pipe({
  name: 'stepCustomFormInputModel',
  pure: false,
})
export class CustomFormInputModelPipe implements PipeTransform {
  private _objectUtils = inject(ObjectUtilsService);

  transform(object: Record<string, unknown>, input: StInput): unknown {
    return this._objectUtils.getObjectFieldValue(object, input.id!);
  }
}
