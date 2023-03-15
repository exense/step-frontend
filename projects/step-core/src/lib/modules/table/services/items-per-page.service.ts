import { Injectable } from '@angular/core';
import { UserService } from '../../../client/generated';

@Injectable({
  providedIn: 'root',
})
export class ItemsPerPageService {
  private defaultItemsPerPage: Array<number> = [10, 25, 50, 100];
  private customItemsPerPage?: number | boolean;

  constructor(private _userService: UserService) {}

  public getItemsPerPage(loadedUserPreferences: Function): any {
    if (this.customItemsPerPage === undefined) {
      this._userService.getPreferences().subscribe((preferences) => {
        if (preferences?.preferences?.['tables_itemsperpage']) {
          this.customItemsPerPage = Number(preferences.preferences['tables_itemsperpage']);
          loadedUserPreferences(Number(preferences.preferences['tables_itemsperpage']));
        }
      });
    }
    const itemsPerPage = this.defaultItemsPerPage;

    if (
      this.customItemsPerPage &&
      typeof this.customItemsPerPage === 'number' &&
      !itemsPerPage.includes(this.customItemsPerPage)
    ) {
      itemsPerPage.unshift(this.customItemsPerPage);
    }

    return itemsPerPage;
  }
}
