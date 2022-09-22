import { Pipe, PipeTransform } from '@angular/core';
import { Input as ColInput } from '../../../client/generated';
import { CustomSearchCellRegistryService } from '../../custom-registeries/services/custom-search-cell-registry.service';

@Pipe({
  name: 'customSearchCellComponent',
})
export class CustomSearchCellComponentsPipe implements PipeTransform {
  constructor(protected _customSearchCells: CustomSearchCellRegistryService) {}

  transform(col: ColInput): string | undefined {
    const componentKeys = this._customSearchCells.filterKeys(col?.searchMapperService ? [col.searchMapperService] : []);
    return componentKeys.length === 0 ? undefined : componentKeys[0];
  }
}
