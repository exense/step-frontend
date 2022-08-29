import { Pipe, PipeTransform } from '@angular/core';
import { Input as ColInput } from '../../../client/generated';
import { CustomCellRegistryService } from '../../custom-registeries/services/custom-cell-registry.service';

@Pipe({
  name: 'customCellComponents',
})
export class CustomCellComponentsPipe implements PipeTransform {
  constructor(protected _customCells: CustomCellRegistryService) {}

  transform(column: ColInput): string[] | undefined {
    const componentKeys = this._customCells.filterKeys(column?.customUIComponents || []);
    return componentKeys.length === 0 ? undefined : componentKeys;
  }
}
