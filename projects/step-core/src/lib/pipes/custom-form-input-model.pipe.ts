import { Pipe, PipeTransform } from '@angular/core';
import { Input as StInput } from '../client/generated';
import { getObjectFieldValue } from '../shared';

@Pipe({
  name: 'stepCustomFormInputModel',
  pure: false,
})
export class CustomFormInputModelPipe implements PipeTransform {
  transform(object: Record<string, unknown>, input: StInput): unknown {
    return getObjectFieldValue(object, input.id!);
  }
}
