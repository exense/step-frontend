import { inject, Injectable, untracked } from '@angular/core';
import { FilePickerDataProviderService, ListDirectoryParams } from '../../file-picker';
import { map, Observable } from 'rxjs';
import { RESOURCE_AP_ID } from './resource-ap-id.token';
import {
  AugmentedAutomationPackagesService,
  DirectoryListing,
  FileDescriptor,
} from '../../../client/step-client-module';

@Injectable()
export class ApResourcePickerDataProviderService implements FilePickerDataProviderService {
  private _resourceAutomationPackageId = inject(RESOURCE_AP_ID, { optional: true });
  private _apApiService = inject(AugmentedAutomationPackagesService);

  private get apId(): string | undefined {
    return untracked(() => this._resourceAutomationPackageId?.());
  }

  getRoots(): Observable<FileDescriptor[]> {
    if (!this.apId) {
      throw new Error('This method requires automation package id definition');
    }
    return this._apApiService.browseApResources(undefined, this.apId).pipe(map((result) => result.entries ?? []));
  }

  listDirectory(path: string, { dirsOnly, filesOnly }: ListDirectoryParams = {}): Observable<DirectoryListing> {
    if (!this.apId) {
      throw new Error('This method requires automation package id definition');
    }
    return this._apApiService.browseApResources(undefined, this.apId, path, filesOnly, dirsOnly);
  }

  downloadResource(path: string): void {
    if (!this.apId) {
      throw new Error('This method requires automation package id definition');
    }
    const list = path.split('/');
    const fileName = list[list.length - 1];
    this._apApiService.downloadAutomationPackageResource(this.apId, path, fileName);
  }

  createDirectory(path: string, name: string): Observable<FileDescriptor> {
    throw new Error('Method not implemented.');
  }
}
