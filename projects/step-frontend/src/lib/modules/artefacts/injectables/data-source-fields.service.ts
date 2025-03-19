import { inject, Injectable } from '@angular/core';
import { DataSourceConf } from '../types/data-source-conf';
import { DataSourceType } from '../types/data-source-type.enum';
import { ArtefactInlineItemSource, AugmentedResourcesService, DynamicValueString } from '@exense/step-core';
import { catchError, map, Observable, of, pipe } from 'rxjs';
import { HttpHeaderResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataSourceFieldsService {
  private _augmentedResourcesService = inject(AugmentedResourcesService);

  createDataSourceFields(
    dataSourceType: DataSourceType,
    dataSource: DataSourceConf,
    withIcons: boolean = false,
  ): Observable<ArtefactInlineItemSource> {
    switch (dataSourceType) {
      case DataSourceType.EXCEL:
        return this.createExcelFields(dataSource, withIcons);
      case DataSourceType.CSV:
        return this.createCsvFields(dataSource, withIcons);
      case DataSourceType.SQL:
        return this.createSqlFields(dataSource, withIcons);
      case DataSourceType.GSHEET:
        return this.createGSheetFields(dataSource, withIcons);
      case DataSourceType.SEQUENCE:
        return this.createSequenceFields(dataSource, withIcons);
      case DataSourceType.JSON_ARRAY:
        return this.createJsonArrayFields(dataSource, withIcons);
      case DataSourceType.JSON:
        return this.createJsonFields(dataSource, withIcons);
      case DataSourceType.FILE:
        return this.createFileFields(dataSource, withIcons);
      case DataSourceType.FOLDER:
        return this.createFolderFields(dataSource, withIcons);
    }
  }

  private createExcelFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const icon = withIcon ? 'log-in' : undefined;
    return this.resolveResource(dataSource.file).pipe(
      map((excelFile) => {
        const result: ArtefactInlineItemSource = [
          ['excel file', excelFile, icon],
          ['worksheet', dataSource.worksheet, icon],
        ];
        if (dataSource.headers.dynamic || dataSource.headers.value) {
          result.push(['headers', dataSource.headers, icon]);
        }
        return result;
      }),
    );
  }

  private createCsvFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const icon = withIcon ? 'log-in' : undefined;
    return this.resolveResource(dataSource.file).pipe(
      map((csvFile) => [
        ['csv file', csvFile, icon],
        ['delimiter', dataSource.delimiter, icon],
      ]),
    );
  }

  private createSqlFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const icon = withIcon ? 'log-in' : undefined;
    return of([
      ['connection string', dataSource.connectionString, icon],
      ['driver class', dataSource.driverClass, icon],
      ['query', dataSource.query, icon],
      ['user', dataSource.user, icon],
      ['password', dataSource.password, icon],
      ['primary write key', dataSource.writePKey, icon],
    ]);
  }

  private createGSheetFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const icon = withIcon ? 'log-in' : undefined;
    return this.resolveResource(dataSource.serviceAccountKey).pipe(
      map((serviceAccountKeyFile) => [
        ['service account key file', serviceAccountKeyFile, icon],
        ['file id', dataSource.fileId, icon],
        ['tab name', dataSource.tabName, icon],
      ]),
    );
  }

  private createSequenceFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const icon = withIcon ? 'log-in' : undefined;
    return of([
      ['start', dataSource.start, icon],
      ['end', dataSource.end, icon],
      ['inc', dataSource.inc, icon],
    ]);
  }

  private createJsonArrayFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const icon = withIcon ? 'log-in' : undefined;
    return of([['json', dataSource.json, icon]]);
  }

  private createJsonFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const icon = withIcon ? 'log-in' : undefined;
    return of([['json string', dataSource.json, icon]]);
  }

  private createFileFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const icon = withIcon ? 'log-in' : undefined;
    return this.resolveResource(dataSource.file).pipe(map((flatFile) => [['flat file', flatFile, icon]]));
  }

  private createFolderFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const icon = withIcon ? 'log-in' : undefined;
    return of([['directory', dataSource.folder, icon]]);
  }

  private resolveResource(value: DynamicValueString): Observable<string | DynamicValueString> {
    if (value.dynamic) {
      return of(value);
    }
    const resourceId = (value.value ?? '').replace('resource:', '');
    if (!resourceId) {
      return of(value?.value ?? '');
    }
    return this._augmentedResourcesService
      .overrideInterceptor(
        pipe(
          catchError((error: HttpHeaderResponse) => {
            if (error.status === HttpStatusCode.NotFound) {
              console.log('ERROR OVERRIDE');
              const empty = new HttpResponse({ status: HttpStatusCode.NoContent });
              return of(empty);
            }
            throw error;
          }),
        ),
      )
      .getResource(resourceId)
      .pipe(
        map((resource) => resource?.resourceName),
        catchError(() => of(undefined)),
        map((name) => name ?? value?.value ?? ''),
      );
  }
}
