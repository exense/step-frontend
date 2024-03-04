import { inject, Pipe, PipeTransform } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';

@Pipe({
  name: 'dashboardUrl',
})
export class DashboardUrlPipe implements PipeTransform {
  private _dashboardService = inject(DashboardService);

  transform(taskId: string): string {
    return this._dashboardService.getDashboardLink(taskId);
  }
}
