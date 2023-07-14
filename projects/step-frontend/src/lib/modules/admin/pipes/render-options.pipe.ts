import { Pipe, PipeTransform } from '@angular/core';
import { Option } from '@exense/step-core';

@Pipe({
  name: 'renderOptions',
})
export class RenderOptionsPipe implements PipeTransform {
  transform(options?: Option[]): string {
    return options ? options.map((option: Option) => option.value).join(', ') : '';
  }
}
