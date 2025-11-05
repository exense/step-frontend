import { Pipe, PipeTransform } from '@angular/core';
import { ScreenInput } from '../types/screen-input';

@Pipe({ name: 'screenInputType', standalone: false, pure: true })
export class ScreenInputTypePipe implements PipeTransform {
  transform(inputId: string | null | undefined, inputs: ScreenInput[] | null | undefined): string {
    if (!inputId || inputId === 'user' || !inputs?.length) return 'other';
    const item = inputs.find((i) => i.id === inputId);
    return (item?.type ?? 'other').toLowerCase();
  }
}
