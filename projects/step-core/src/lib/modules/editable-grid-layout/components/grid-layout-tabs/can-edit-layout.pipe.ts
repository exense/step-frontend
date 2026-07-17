import { inject, Pipe, PipeTransform } from '@angular/core';
import { GridLayoutPermissionUtilsService } from '../../injectables/grid-layout-permission-utils.service';
import { GridPresetListItem } from '../../types/grid-preset-list-item';

@Pipe({
  name: 'canEditLayout',
})
export class CanEditLayoutPipe implements PipeTransform {
  private _gridLayoutUtils = inject(GridLayoutPermissionUtilsService);

  transform(layout?: GridPresetListItem): boolean {
    return this._gridLayoutUtils.canEditLayout(layout);
  }
}
