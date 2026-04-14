import { inject, Injectable } from '@angular/core';
import { DataSourceConf } from '../types/data-source-conf';
import { DataSourceType } from '../types/data-source-type.enum';
import {
  ArtefactInlineItemSource,
  AugmentedResourcesService,
  DynamicSimpleValue,
  DynamicValueString,
  ItemType,
  ResourceInputUtilsService,
} from '@exense/step-core';
import { catchError, map, Observable, of, pipe } from 'rxjs';
import { HttpHeaderResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataSourceFieldsService {
  private _augmentedResourcesService = inject(AugmentedResourcesService);
  private _resourceUtils = inject(ResourceInputUtilsService);

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

  extractDataSourceSearchValues(dataSourceType: DataSourceType, dataSource: DataSourceConf): DynamicSimpleValue[] {
    switch (dataSourceType) {
      case DataSourceType.EXCEL:
        return this.extractExcelSearchFields(dataSource);
      case DataSourceType.CSV:
        return this.extractCsvSearchFields(dataSource);
      case DataSourceType.SQL:
        return this.extractSqlSearchFields(dataSource);
      case DataSourceType.GSHEET:
        return this.extractGSheetSearchFields(dataSource);
      case DataSourceType.SEQUENCE:
        return this.extractSequenceSearchFields(dataSource);
      case DataSourceType.JSON_ARRAY:
        return this.extractJsonArraySearchFields(dataSource);
      case DataSourceType.JSON:
        return this.extractJsonSearchFields(dataSource);
      case DataSourceType.FILE:
        return this.extractFileSearchFields(dataSource);
      case DataSourceType.FOLDER:
        return this.extractFolderSearchFields(dataSource);
    }
  }

  private createExcelFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const itemType = withIcon ? ItemType.configuration : undefined;
    return this.resolveResource(dataSource.file).pipe(
      map((excelFile) => {
        const result: ArtefactInlineItemSource = [
          { label: 'excel file', value: excelFile, itemType },
          { label: 'worksheet', value: dataSource.worksheet, itemType },
        ];
        if (dataSource.headers.dynamic || dataSource.headers.value) {
          result.push({ label: 'headers', value: dataSource.headers, itemType });
        }
        return result;
      }),
    );
  }

  private extractExcelSearchFields(dataSource: DataSourceConf): DynamicSimpleValue[] {
    return [dataSource.file, dataSource.worksheet, dataSource.password, dataSource.headers];
  }

  private createCsvFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const itemType = withIcon ? ItemType.configuration : undefined;
    return this.resolveResource(dataSource.file).pipe(
      map((csvFile) => [
        { label: 'csv file', value: csvFile, itemType },
        { label: 'delimiter', value: dataSource.delimiter, itemType },
      ]),
    );
  }

  private extractCsvSearchFields(dataSource: DataSourceConf): DynamicSimpleValue[] {
    return [dataSource.file, dataSource.delimiter];
  }

  private createSqlFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const itemType = withIcon ? ItemType.configuration : undefined;
    return of([
      { label: 'connection string', value: dataSource.connectionString, itemType },
      { label: 'driver class', value: dataSource.driverClass, itemType },
      { label: 'query', value: dataSource.query, itemType },
      { label: 'user', value: dataSource.user, itemType },
      { label: 'password', value: dataSource.password, itemType },
      { label: 'primary write key', value: dataSource.writePKey, itemType },
    ]);
  }

  private extractSqlSearchFields(dataSource: DataSourceConf): DynamicSimpleValue[] {
    return [
      dataSource.connectionString,
      dataSource.driverClass,
      dataSource.query,
      dataSource.user,
      dataSource.password,
      dataSource.writePKey,
    ];
  }

  private createGSheetFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const itemType = withIcon ? ItemType.configuration : undefined;
    return this.resolveResource(dataSource.serviceAccountKey).pipe(
      map((serviceAccountKeyFile) => [
        { label: 'service account key file', value: serviceAccountKeyFile, itemType },
        { label: 'file id', value: dataSource.fileId, itemType },
        { label: 'tab name', value: dataSource.tabName, itemType },
      ]),
    );
  }

  private extractGSheetSearchFields(dataSource: DataSourceConf): DynamicSimpleValue[] {
    return [dataSource.serviceAccountKey, dataSource.fileId, dataSource.tabName];
  }

  private createSequenceFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const itemType = withIcon ? ItemType.configuration : undefined;
    return of([
      { label: 'start', value: dataSource.start, itemType },
      { label: 'end', value: dataSource.end, itemType },
      { label: 'inc', value: dataSource.inc, itemType },
    ]);
  }

  private extractSequenceSearchFields(dataSource: DataSourceConf): DynamicSimpleValue[] {
    return [dataSource.start, dataSource.end, dataSource.inc];
  }

  private createJsonArrayFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const itemType = withIcon ? ItemType.configuration : undefined;
    return of([{ label: 'json', value: dataSource.json, itemType }]);
  }

  private extractJsonArraySearchFields(dataSource: DataSourceConf): DynamicSimpleValue[] {
    return [dataSource.json];
  }

  private createJsonFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const itemType = withIcon ? ItemType.configuration : undefined;
    return of([{ label: 'json string', value: dataSource.json, itemType }]);
  }

  private extractJsonSearchFields(dataSource: DataSourceConf): DynamicSimpleValue[] {
    return [dataSource.json];
  }

  private createFileFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const itemType = withIcon ? ItemType.configuration : undefined;
    return this.resolveResource(dataSource.file).pipe(map((flatFile) => [{ label: 'flat file', value: flatFile, itemType }]));
  }

  private extractFileSearchFields(dataSource: DataSourceConf): DynamicSimpleValue[] {
    return [dataSource.file];
  }

  private createFolderFields(dataSource: DataSourceConf, withIcon?: boolean): Observable<ArtefactInlineItemSource> {
    const itemType = withIcon ? ItemType.configuration : undefined;
    return of([{ label: 'directory', value: dataSource.folder, itemType }]);
  }

  private extractFolderSearchFields(dataSource: DataSourceConf): DynamicSimpleValue[] {
    return [dataSource.folder];
  }

  private resolveResource(value: DynamicValueString): Observable<string | DynamicValueString> {
    if (value.dynamic) {
      return of(value);
    }
    if (!this._resourceUtils.isResourceValue(value?.value)) {
      return of(value?.value ?? '');
    }
    const resourceId = this._resourceUtils.getResourceId(value.value)!;
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
