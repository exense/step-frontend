import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inputType',
  standalone: false,
})
export class InputTypePipe implements PipeTransform {
  transform(inputId: string, inputs: any[]): string {
    if (!inputId || inputId === 'user') {
      return 'other';
    } else {
      const item = inputs.find((el) => el.id === inputId);
      return item?.type?.toLowerCase();
    }
  }
}
