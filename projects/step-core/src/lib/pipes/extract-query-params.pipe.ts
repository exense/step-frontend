import { Pipe, PipeTransform } from '@angular/core';
import { Params } from '@angular/router';

@Pipe({
  name: 'extractQueryParams',
  standalone: false,
})
export class ExtractQueryParamsPipe implements PipeTransform {
  transform(url: string): Params {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const params: Record<string, string | string[]> = {};
    urlParams.forEach((value, key) => {
      if (urlParams.getAll(key).length > 1) {
        params[key] = urlParams.getAll(key);
      } else {
        params[key] = value;
      }
    });
    return params;
  }
}
