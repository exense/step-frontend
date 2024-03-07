import { Injectable } from '@angular/core';
import { DashboardView } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class DashboardUrlService {
  dashboardEditorUrl(dashboard: DashboardView): string {
    if (dashboard.metadata?.['isLegacy']) {
      const link = dashboard.metadata?.['link'];
      if (link) {
        return link;
      } else {
        console.error('No link specified for dashboard');
        return '';
      }
    } else {
      return `/dashboards/${dashboard.id}`;
    }
  }
}
