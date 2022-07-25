import { Pipe, PipeTransform } from '@angular/core';
import { PropertyAccessorService } from '../../../services/property-accessor.service';

@Pipe({
  name: 'customCellValue',
})
export class CustomCellValuePipe implements PipeTransform {
  constructor(private _propertyAccessor: PropertyAccessorService) {}

  transform(value: any, path: string): unknown {
    return this._propertyAccessor.getProperty(value, path);
  }
}
