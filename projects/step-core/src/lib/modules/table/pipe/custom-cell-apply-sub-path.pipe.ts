import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCellApplySubPath',
  standalone: false,
})
export class CustomCellApplySubPathPipe implements PipeTransform {
  static transform(value: string, entitySubPath?: string): string {
    return !entitySubPath ? value : `${entitySubPath}.${value}`;
  }

  transform(value: string, entitySubPath?: string): string {
    return CustomCellApplySubPathPipe.transform(value, entitySubPath);
  }
}
