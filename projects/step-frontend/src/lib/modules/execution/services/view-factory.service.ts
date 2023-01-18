import { Injectable } from '@angular/core';
import { INJECTOR } from '@exense/step-core';
import { IPromise } from 'angular';

@Injectable({
  providedIn: 'root',
  useFactory: ($injector: any) => $injector.get('viewFactory'),
  deps: [INJECTOR],
})
export abstract class ViewFactoryService {
  abstract getReportNodeStatisticCharts(executionId: string): IPromise<{
    throughputchart: any | { series: any[] };
  }>;
}
