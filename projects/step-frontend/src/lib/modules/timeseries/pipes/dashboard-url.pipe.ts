import { inject, Pipe, PipeTransform } from '@angular/core';
import { DashboardView } from '@exense/step-core';
import { DashboardUrlService } from '../injectables/dashboard-url.service';

@Pipe({
  name: 'dashboardUrl',
  standalone: true,
})
export class DashboardUrlPipe implements PipeTransform {
  private _dashboardUrl = inject(DashboardUrlService);

  transform(dashboard: DashboardView): string {
    return this._dashboardUrl.dashboardEditorUrl(dashboard);
  }
}
