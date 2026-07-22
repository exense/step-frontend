import { inject, Pipe, PipeTransform } from '@angular/core';
import { GridLayoutPermissionUtilsService } from '../../injectables/grid-layout-permission-utils.service';
import { GridPresetListItem } from '../../types/grid-preset-list-item';

@Pipe({
  name: 'canDownloadLayout',
})
export class CanDownloadLayoutPipe implements PipeTransform {
  private _gridLayoutUtils = inject(GridLayoutPermissionUtilsService);

  transform(layout?: GridPresetListItem): boolean {
    return this._gridLayoutUtils.canDownloadLayout(layout);
  }
}
