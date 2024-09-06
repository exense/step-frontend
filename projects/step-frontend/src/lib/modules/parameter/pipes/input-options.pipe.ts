import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inputOptions',
})
export class InputOptionsPipe implements PipeTransform {
  transform(inputId: string, inputs: any[]): any[] {
    const result: any[] = [];
    const item = inputs.find((el: any) => el.id === inputId);
    item.options?.forEach((el: any) => {
      result.push(el.value);
    });
    return result;
  }
}
