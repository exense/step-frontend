import { inject, Injectable } from '@angular/core';
import { UserService } from '../../../client/generated';
import { ItemsPerPageService } from './items-per-page.service';

@Injectable({
  providedIn: 'root',
})
export class ItemsPerPageDefaultService implements ItemsPerPageService {
  private _userService = inject(UserService);

  readonly defaultItemsPerPage: Array<number> = [10, 25, 50, 100];
  private customItemsPerPage?: number | boolean;

  getItemsPerPage(loadedUserPreferences: (itemsPerPage: number) => void): Array<number> {
    if (this.customItemsPerPage === undefined) {
      this._userService.getPreferences().subscribe((preferences) => {
        const tables_itemsperpage = preferences?.preferences?.['tables_itemsperpage'];
        if (tables_itemsperpage) {
          this.customItemsPerPage = Number(tables_itemsperpage);
          loadedUserPreferences(Number(tables_itemsperpage));
        }
      });
    }
    const itemsPerPage = [...this.defaultItemsPerPage];

    if (this.customItemsPerPage && typeof this.customItemsPerPage === 'number') {
      this.prepandToArray(itemsPerPage, this.customItemsPerPage);
    }

    return itemsPerPage;
  }

  private prepandToArray(array: number[], value: number) {
    if (array.includes(value)) {
      /* The custom item needs to be the first item, even if already in the array */
      const removeIndex = array.indexOf(value);
      array.splice(removeIndex, 1);
    }
    array.unshift(value);
  }
}
