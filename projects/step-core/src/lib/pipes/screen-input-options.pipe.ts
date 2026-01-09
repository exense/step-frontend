import { Pipe, PipeTransform } from '@angular/core';
import { ScreenInput } from '../types/screen-input';

@Pipe({ name: 'screenInputOptions', standalone: false, pure: true })
export class ScreenInputOptionsPipe implements PipeTransform {
  transform(inputId: string | null | undefined, inputs: ScreenInput[] | null | undefined): string[] {
    if (!inputId || !inputs?.length) return [];
    const item = inputs.find((i) => i.id === inputId);
    return item?.options?.map((o) => o.value) ?? [];
  }
}
