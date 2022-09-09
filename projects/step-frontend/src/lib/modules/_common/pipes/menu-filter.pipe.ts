import { Pipe, PipeTransform } from '@angular/core';
import { MenuEntry } from '@exense/step-core';

@Pipe({
  name: 'menuFilter',
})
export class MenuFilterPipe implements PipeTransform {
  transform(menuEntries: MenuEntry[], parentMenu: string): MenuEntry[] {
    let filteredEntries;
    if (parentMenu === 'root') {
      filteredEntries = menuEntries.filter((entry) => entry && !entry.parentMenu && entry.isEnabledFct());
    } else {
      filteredEntries = menuEntries.filter((entry) => entry?.parentMenu === parentMenu && entry.isEnabledFct());
    }

    const weightCompare = (a: MenuEntry, b: MenuEntry) => {
      if (!a.weight) {
        return 1;
      }
      if (!b.weight) {
        return -1;
      }
      return a.weight - b.weight;
    };

    return filteredEntries.sort(weightCompare);
  }
}
