/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { ExportStatus } from '../models/ExportStatus';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class ExportsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param entity
   * @param recursively
   * @param filename
   * @param additionalEntities
   * @returns ExportStatus default response
   * @throws ApiError
   */
  public exportEntities(
    entity: string,
    recursively?: boolean,
    filename?: string,
    additionalEntities?: Array<string>
  ): Observable<ExportStatus> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/export/{entity}',
      path: {
        entity: entity,
      },
      query: {
        recursively: recursively,
        filename: filename,
        additionalEntities: additionalEntities,
      },
    });
  }

  /**
   * @param entity
   * @param id
   * @param recursively
   * @param filename
   * @param additionalEntities
   * @returns ExportStatus default response
   * @throws ApiError
   */
  public exportEntityById(
    entity: string,
    id: string,
    recursively?: boolean,
    filename?: string,
    additionalEntities?: Array<string>
  ): Observable<ExportStatus> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/export/{entity}/{id}',
      path: {
        entity: entity,
        id: id,
      },
      query: {
        recursively: recursively,
        filename: filename,
        additionalEntities: additionalEntities,
      },
    });
  }

  /**
   * @param id
   * @returns ExportStatus default response
   * @throws ApiError
   */
  public getExportStatus(id: string): Observable<ExportStatus> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/export/{id}/status',
      path: {
        id: id,
      },
    });
  }
}
