import { inject, Injectable } from '@angular/core';
import { TimeSeriesService } from '../../generated';
import { Observable, switchMap } from 'rxjs';
import { TableApiWrapperService } from '../../table/step-table-client.module';

@Injectable({
  providedIn: 'root',
})
export class AugmentedTimeSeriesService extends TimeSeriesService {
  private _tableApi = inject(TableApiWrapperService);

  exportRawMeasurementsAsCSV(oqlFilter: string): Observable<string> {
    return this.getMeasurementsAttributes(oqlFilter).pipe(
      switchMap((fields) => this._tableApi.exportAsCSV('measurements', fields, { filters: [{ oql: oqlFilter }] })),
    );
  }
}
