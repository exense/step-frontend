import { Injectable } from '@angular/core';
import { allIcons } from '../icons';

const STRING_CAMELIZE_REGEXP = /(-|_|\.|\s)+(.)?/g;

const camelize = (str: string) => str
  .replace(STRING_CAMELIZE_REGEXP, (_match, _separator, chr) => {
    return chr ? chr.toUpperCase() : '';
  })
  .replace(/^([A-Z])/, (match) => match.toLowerCase());

const upperCamelize = (str: string) => {
  const camelCase = camelize(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

@Injectable({
  providedIn: 'root'
})
export class IconProviderService {
  getIcon(key: string): string {
     const iconName = upperCamelize(key);
     const svg = (allIcons as any)[iconName] || '';
     if (!svg) {
       console.warn(`Icon not found ${key}`);
     }
     return svg;
  }
}
