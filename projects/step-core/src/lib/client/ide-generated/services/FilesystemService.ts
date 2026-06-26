/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { CreateDirectoryRequest } from '../models/CreateDirectoryRequest';
import type { DirectoryListing } from '../models/DirectoryListing';
import type { FileDescriptor } from '../models/FileDescriptor';

import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class FilesystemService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param requestBody
   * @returns FileDescriptor default response
   * @throws ApiError
   */
  public createDirectory(requestBody?: CreateDirectoryRequest): Observable<FileDescriptor> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/local/fs/createDirectory',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns FileDescriptor default response
   * @throws ApiError
   */
  public getRoots(): Observable<Array<FileDescriptor>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/local/fs/roots',
    });
  }

  /**
   * @param path
   * @param showHidden
   * @param filesOnly
   * @param dirsOnly
   * @returns DirectoryListing default response
   * @throws ApiError
   */
  public listDirectory(
    path?: string,
    showHidden: boolean = false,
    filesOnly: boolean = false,
    dirsOnly: boolean = false,
  ): Observable<DirectoryListing> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/local/fs/listDirectory',
      query: {
        path: path,
        showHidden: showHidden,
        filesOnly: filesOnly,
        dirsOnly: dirsOnly,
      },
    });
  }
}
