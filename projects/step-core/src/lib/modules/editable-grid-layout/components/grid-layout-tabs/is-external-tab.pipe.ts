import { inject, Pipe, PipeTransform } from '@angular/core';
import { GridLayoutTab } from '../../types/grid-layout-tab';
import { GridLayoutExternalTabsService } from '../../injectables/grid-layout-external-tabs.service';

@Pipe({
  name: 'isExternalTab',
})
export class IsExternalTabPipe implements PipeTransform {
  private _gridLayoutTabs = inject(GridLayoutExternalTabsService, { optional: true });

  transform(tab: GridLayoutTab): boolean {
    if (!this._gridLayoutTabs) {
      return false;
    }
    return this._gridLayoutTabs.isExternalTab(tab);
  }
}
