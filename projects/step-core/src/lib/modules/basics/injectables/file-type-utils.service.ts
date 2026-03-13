import { Injectable } from '@angular/core';
import { TypeInfo, TypeInfoCategory } from '../types/type-info';
import { FILE_TYPES } from '../types/file-types';

@Injectable({
  providedIn: 'root',
})
export class FileTypeUtilsService {
  private mimeTypesDictionary = Object.values(FILE_TYPES).reduce((res, type) => {
    if (!type.mimeType) {
      return res;
    }
    if (!res.has(type.mimeType)) {
      res.set(type.mimeType, []);
    }
    const types = res.get(type.mimeType)!;
    types.push(type);
    return res;
  }, new Map<string, TypeInfo[]>());

  private extensionsDictionary = Object.values(FILE_TYPES).reduce((res, type) => {
    if (!type.extension) {
      return res;
    }
    res.set(type.extension, type);
    return res;
  }, new Map<string, TypeInfo>());

  findByExtension(extension?: string): TypeInfo | undefined {
    const result = this.extensionsDictionary.get(extension ?? '');
    return result?.isCustom ? undefined : result;
  }

  findByMimeTypeAndExtension(mimeType?: string, extension?: string): TypeInfo[] {
    let types = this.mimeTypesDictionary.get(mimeType ?? '') ?? [];
    if (extension) {
      types = types.filter((type) => type.extension === extension);
    }
    return types;
  }

  checkTypeCategory(mimeType?: string): TypeInfoCategory | undefined {
    const types = this.mimeTypesDictionary.get(mimeType ?? '') ?? [];
    return types?.[0]?.category;
  }
}
