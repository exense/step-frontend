import { inject, Pipe, PipeTransform } from '@angular/core';
import { SingleExecutionPanelsService } from '../services/single-execution-panels.service';

@Pipe({
  name: 'panelId',
  standalone: false,
})
export class PanelIdPipe implements PipeTransform {
  private _panels = inject(SingleExecutionPanelsService);

  transform(viewId?: string): string | undefined {
    return !viewId ? undefined : this._panels.getPanelId(viewId!);
  }
}
