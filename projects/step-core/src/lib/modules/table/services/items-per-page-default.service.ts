import { inject, Injectable } from '@angular/core';
import { UserService } from '../../../client/generated';
import { ItemsPerPageService } from './items-per-page.service';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemsPerPageDefaultService implements ItemsPerPageService {
  private _userService = inject(UserService);

  readonly defaultItemsPerPage: Array<number> = [10, 25, 50, 100];
  private customItemsPerPage?: number | boolean;

  getItemsPerPage(): Observable<number[]> {
    if (this.customItemsPerPage === undefined) {
      return this.getPreferencesItemPerPage().pipe(
        map((itemsPerPage) => {
          this.customItemsPerPage = itemsPerPage ?? true;
          return this.getItems();
        }),
      );
    }
    return of(this.getItems());
  }

  getDefaultPageSizeItem(): Observable<number> {
    return this.getItemsPerPage().pipe(map((items) => items[0]));
  }

  private getItems(): number[] {
    const itemsPerPage = [...this.defaultItemsPerPage];
    if (this.customItemsPerPage && typeof this.customItemsPerPage === 'number') {
      this.prepandToArray(itemsPerPage, this.customItemsPerPage);
    }
    return itemsPerPage;
  }

  private getPreferencesItemPerPage(): Observable<number | undefined> {
    return this._userService.getPreferences().pipe(
      map((preferences) => preferences?.preferences?.['tables_itemsperpage'] ?? ''),
      map((itemsPerPageString) => parseInt(itemsPerPageString)),
      map((itemsPerPage) => (isNaN(itemsPerPage) ? undefined : itemsPerPage)),
    );
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
