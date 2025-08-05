import { Pipe, PipeTransform } from '@angular/core';
import { Tab } from '@exense/step-core';

@Pipe({
  name: 'includeTab',
  standalone: false,
})
export class IncludeTabPipe implements PipeTransform {
  transform({ id: tabId }: Tab<string>, activeTabId?: string): boolean {
    return (
      tabId === activeTabId ||
      (tabId === 'steps' && activeTabId === 'tree') ||
      (tabId === 'tree' && activeTabId === 'steps')
    );
  }
}
