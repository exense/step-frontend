import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'panelId',
})
export class PanelIdPipe implements PipeTransform {
  transform(elId: string, viewId: string): string {
    return elId + viewId;
  }
}
