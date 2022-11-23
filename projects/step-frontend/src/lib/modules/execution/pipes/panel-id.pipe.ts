import { Pipe, PipeTransform } from '@angular/core';
import { SingleExecutionPanelsService } from '../services/single-execution-panels.service';

@Pipe({
  name: 'panelId',
})
export class PanelIdPipe implements PipeTransform {
  constructor(private _panels: SingleExecutionPanelsService) {}
  transform(viewId?: string): string | undefined {
    return !viewId ? undefined : this._panels.getPanelId(viewId!);
  }
}
