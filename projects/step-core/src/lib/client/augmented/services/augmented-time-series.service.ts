import { inject, Injectable } from '@angular/core';
import { TimeSeriesService } from '../../generated';
import { Observable, OperatorFunction, switchMap } from 'rxjs';
import { TableApiWrapperService } from '../../table/step-table-client.module';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { HttpEvent } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AugmentedTimeSeriesService extends TimeSeriesService implements HttpOverrideResponseInterceptor {
  private _tableApi = inject(TableApiWrapperService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  exportRawMeasurementsAsCSV(oqlFilter: string): Observable<string> {
    return this.getMeasurementsAttributes(oqlFilter).pipe(
      switchMap((fields) => this._tableApi.exportAsCSV('measurements', fields, { filters: [{ oql: oqlFilter }] })),
    );
  }
}
