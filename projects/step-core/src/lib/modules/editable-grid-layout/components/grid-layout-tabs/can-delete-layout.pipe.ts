import { inject, Pipe, PipeTransform } from '@angular/core';
import { GridPresetListItem } from '../../types/grid-preset-list-item';
import { GridLayoutPermissionUtilsService } from '../../injectables/grid-layout-permission-utils.service';

@Pipe({
  name: 'canDeleteLayout',
})
export class CanDeleteLayoutPipe implements PipeTransform {
  private _gridLayoutUtils = inject(GridLayoutPermissionUtilsService);

  transform(layout?: GridPresetListItem): boolean {
    return this._gridLayoutUtils.canDeleteLayout(layout);
  }
}
