import { Pipe, PipeTransform } from '@angular/core';
import { Input as ColInput } from '../../../client/generated';

@Pipe({
  name: 'customCellComponents',
})
export class CustomCellComponentsPipe implements PipeTransform {
  transform(column: ColInput, screen?: string): string[] | undefined {
    // Temporary returns the hardcoded custom cell keys for a special screens, in case if the column contains defined valueHtmlTemplate
    // The final implementation, should extract those keys from column itself (required backend changes)

    if (!column?.valueHtmlTemplate) {
      return undefined;
    }

    switch (screen) {
      case 'planTable':
        return ['planLink'];
      case 'schedulerTable':
        return ['taskLink'];
      default:
        return undefined;
    }
  }
}
