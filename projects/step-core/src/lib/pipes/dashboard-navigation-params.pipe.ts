import { Pipe, PipeTransform } from '@angular/core';
import { ExecutiontTaskParameters } from '../client/generated';
import { Params } from '@angular/router';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

@Pipe({
  name: 'dashboardNavigationParams',
  standalone: false,
})
export class DashboardNavigationParamsPipe implements PipeTransform {
  transform(params?: string | ExecutiontTaskParameters | Record<string, any> | null): Params {
    if (!params) {
      return {};
    }

    let parameters: Record<string, any>;
    if (typeof params !== 'string' && !params.id && !params.name) {
      parameters = params;
    } else {
      const taskId = typeof params === 'string' ? params : params.id!;

      parameters = {
        dc_q_taskId: taskId,
        dc_refreshInterval: 5000,
        dc_rangeType: 'RELATIVE',
        dc_relativeRange: ONE_DAY_MS,
      };
    }

    return {
      ...parameters,
      tsParams: Object.keys(parameters).join(','),
    };
  }
}
