import { inject, Injectable } from '@angular/core';
import {
  DirectoryListing,
  FileDescriptor,
  FilePickerDataProviderService,
  FilesystemService,
  ListDirectoryParams,
} from '@exense/step-core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApFsDataProviderService implements FilePickerDataProviderService {
  private _filesystemService = inject(FilesystemService);

  getRoots(): Observable<FileDescriptor[]> {
    return this._filesystemService.getRoots();
  }
  listDirectory(
    path: string,
    { showHidden, filesOnly, dirsOnly }: ListDirectoryParams = {},
  ): Observable<DirectoryListing> {
    return this._filesystemService.listDirectory(path, showHidden, filesOnly, dirsOnly);
  }
  createDirectory(path: string, name: string): Observable<FileDescriptor> {
    return this._filesystemService.createDirectory({ parentPath: path, name });
  }
}
