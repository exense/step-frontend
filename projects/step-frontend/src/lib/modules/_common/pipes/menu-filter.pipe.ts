import { Pipe, PipeTransform } from '@angular/core';
import { MenuEntry } from '@exense/step-core';

@Pipe({
  name: 'menuFilter',
})
export class MenuFilterPipe implements PipeTransform {
  transform(menuEntries: MenuEntry[], parentMenu: string): MenuEntry[] {
    if (parentMenu === 'root') {
      return menuEntries.filter((entry) => entry && !entry.parentMenu && entry.isEnabledFct());
    }

    const filteredEntries = menuEntries.filter((entry) => entry?.parentMenu === parentMenu && entry.isEnabledFct());
    return filteredEntries.sort((a, b) => a.label.localeCompare(b.label));
  }
}
