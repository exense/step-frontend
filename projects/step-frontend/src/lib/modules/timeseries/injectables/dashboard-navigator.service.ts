import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardView } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class DashboardNavigatorService {
  private _router = inject(Router);

  createDashboard(): void {
    this._router.navigate(['dashboards', 'new']);
  }

  navigateToDashboard(dashboard: DashboardView, editMode = false): void {
    if (dashboard.metadata?.['isLegacy']) {
      const link = dashboard.metadata?.['link'];
      if (link) {
        this._router.navigate([link]);
      } else {
        console.error('No link specified for dashboard');
      }
    } else {
      this._router.navigate(['dashboards', dashboard.id], {
        queryParams: { edit: editMode ? '1' : '0' },
        queryParamsHandling: 'merge',
      });
    }
  }
}
