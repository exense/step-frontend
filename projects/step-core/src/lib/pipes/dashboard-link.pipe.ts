import { Pipe, PipeTransform } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';

@Pipe({
  name: 'dashboardLink',
})
export class DashboardLinkPipe implements PipeTransform {
  constructor(private _dashboardService: DashboardService) {}

  transform(taskId: string): string {
    return this._dashboardService.getDashboardLink(taskId);
  }
}
