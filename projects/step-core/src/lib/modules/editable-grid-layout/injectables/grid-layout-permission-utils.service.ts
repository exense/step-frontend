import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
import { GridPresetListItem } from '../types/grid-preset-list-item';
import { LayoutPermissions } from '../types/layout-permissions';

@Injectable({
  providedIn: 'root',
})
export class GridLayoutPermissionUtilsService {
  private _auth = inject(AuthService);

  isForeignLayout(layout?: GridPresetListItem): boolean {
    return !!layout?.creationUser && !!this._auth.isAuthenticated() && layout.creationUser !== this._auth.getUserID();
  }

  isForeignSharedLayout(layout?: GridPresetListItem): boolean {
    return this.isForeignLayout(layout) && layout?.visibility === 'Shared';
  }

  canEditLayout(layout?: GridPresetListItem): boolean {
    if (!layout || layout.visibility === 'Preset' || this.isForeignLayout(layout)) {
      return false;
    }
    return this._auth.hasRight(LayoutPermissions.REPORT_LAYOUT_WRITE);
  }

  canDeleteLayout(layout?: GridPresetListItem): boolean {
    if (!layout || layout.visibility === 'Preset') {
      return false;
    }
    if (this.isForeignSharedLayout(layout)) {
      return this._auth.hasRight(LayoutPermissions.REPORT_LAYOUT_SHARED_DELETE);
    }
    return this._auth.hasRight(LayoutPermissions.REPORT_LAYOUT_DELETE);
  }

  canDownloadLayout(layout?: GridPresetListItem): boolean {
    const isAdmin = this._auth.hasRight('admin-ui-menu');
    const canReadLayouts = this._auth.hasRight(LayoutPermissions.REPORT_LAYOUT_READ);
    return !!layout && (isAdmin || canReadLayouts);
  }
}
