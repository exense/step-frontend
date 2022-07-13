import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FlatObjectFormatService {
  constructor() {}

  format(obj: any): string {
    return JSON.stringify(obj)
      .replace(/{/g, '')
      .replace(/}/g, '')
      .replace(/:/g, '=')
      .replace(/,/g, ', ')
      .replace(/"/g, '');
  }
}
