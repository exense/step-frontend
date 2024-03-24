import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MultipleProjectsService } from '../modules/basics/step-basics.module';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private _multipleProjects = inject(MultipleProjectsService);

  generateDashboardLink(parameters: Record<string, any>): string {
    let httpParams = new HttpParams();
    Object.keys(parameters).forEach((key) => {
      httpParams = httpParams.append('dc_' + key, parameters[key]);
    });
    const currentTenant = this._multipleProjects.currentProject()?.name || '';
    httpParams = httpParams.append('tenant', currentTenant);

    return `#/analytics?${httpParams.toString()}`;
  }

  getDashboardLink(taskId: string): string {
    const parameters = {
      q_taskId: taskId,
      refresh: 1,
      relativeRange: ONE_DAY_MS,
    };

    return this.generateDashboardLink(parameters);
  }
}
