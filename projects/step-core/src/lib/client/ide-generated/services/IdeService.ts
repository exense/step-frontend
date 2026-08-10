/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AutomationPackageDescriptor } from '../models/AutomationPackageDescriptor';
import type { DirectoryListing } from '../../generated/models/DirectoryListing';

import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class IdeService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param path
   * @param filesOnly
   * @param dirsOnly
   * @returns DirectoryListing default response
   * @throws ApiError
   */
  public browseAp(path?: string, filesOnly: boolean = false, dirsOnly: boolean = false): Observable<DirectoryListing> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/local/ide/ap/browse',
      query: {
        path: path,
        filesOnly: filesOnly,
        dirsOnly: dirsOnly,
      },
    });
  }

  /**
   * @returns any default response
   * @throws ApiError
   */
  public closeAp(): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/local/ide/ap/close',
    });
  }

  /**
   * @param path
   * @param inline
   * @returns any default response
   * @throws ApiError
   */
  public getApContent(path?: string, inline?: boolean): Observable<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/local/ide/ap/content',
      query: {
        path: path,
        inline: inline,
      },
    });
  }

  /**
   * @returns AutomationPackageDescriptor default response
   * @throws ApiError
   */
  public getCurrentAp(): Observable<AutomationPackageDescriptor> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/local/ide/ap/current',
    });
  }

  /**
   * @param existingEmptyDirectory
   * @param apName
   * @returns any default response
   * @throws ApiError
   */
  public initializeNewAp(existingEmptyDirectory?: string, apName?: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/local/ide/ap/initialize-new',
      query: {
        existingEmptyDirectory: existingEmptyDirectory,
        apName: apName,
      },
    });
  }

  /**
   * @param directory
   * @returns any default response
   * @throws ApiError
   */
  public useExistingAp(directory?: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/local/ide/ap/use-existing',
      query: {
        directory: directory,
      },
    });
  }
}
