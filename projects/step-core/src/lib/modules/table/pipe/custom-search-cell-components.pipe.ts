import { inject, Pipe, PipeTransform } from '@angular/core';
import { Input as ColInput } from '../../../client/generated';
import { CustomSearchCellRegistryService } from '../../custom-registeries/services/custom-search-cell-registry.service';

const RENDER_COL_TYPES: Array<ColInput['type']> = ['DROPDOWN', 'CHECKBOX'];

@Pipe({
  name: 'customSearchCellComponent',
  standalone: false,
})
export class CustomSearchCellComponentsPipe implements PipeTransform {
  private _customSearchCells = inject(CustomSearchCellRegistryService);

  transform(col: ColInput): string | undefined {
    const componentKeys = this._customSearchCells.filterKeys(col?.searchMapperService ? [col.searchMapperService] : []);
    if (componentKeys.length > 0) {
      return componentKeys[0];
    }
    if (RENDER_COL_TYPES.includes(col.type)) {
      return col.type;
    }
    return undefined;
  }
}
