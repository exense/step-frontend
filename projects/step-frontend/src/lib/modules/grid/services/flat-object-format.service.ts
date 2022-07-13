import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FlatObjectFormatService {
  constructor() {}

  format(obj: any): string {
    let str = '';
    for (let key of Object.keys(obj)) {
      str = str.concat(key).concat('=').concat(obj[key]).concat(', ');
    }
    return str;
  }
}
