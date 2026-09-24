import { Observable } from 'rxjs';
import { DirectoryListing, FileDescriptor } from '../../../client/step-client-module';

export interface ListDirectoryParams {
  showHidden?: boolean;
  filesOnly?: boolean;
  dirsOnly?: boolean;
}

export abstract class FilePickerDataProviderService {
  abstract getRoots(): Observable<FileDescriptor[]>;
  abstract listDirectory(path: string, params?: ListDirectoryParams): Observable<DirectoryListing>;
  abstract createDirectory(path: string, name: string): Observable<FileDescriptor>;
}
