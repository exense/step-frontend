import { Injectable } from '@angular/core';
import { KeyValue } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class JsonViewerFormatterService {
  formatToJsonString(value: unknown): string {
    const jsonObject = this.getJson(value);
    return JSON.stringify(jsonObject, null, 2);
  }

  formatToKeyValue(value: unknown, isCheckDynamicValues?: boolean): KeyValue<string, string>[] {
    const jsonObject = this.getJson(value);
    return Object.entries(jsonObject).reduce((res, [key, value]) => {
      if (isCheckDynamicValues) {
        value = value.value ? value.value : value;
        value = value.expression ? value.expression : value;
      }
      if (value && typeof value === 'object') {
        value = JSON.stringify(value);
      }
      value = value.toString();
      res.push({ key, value });
      return res;
    }, [] as KeyValue<string, string>[]);
  }

  private getJson(value: unknown): Record<string, any> {
    return typeof value === 'string' ? JSON.parse(value) : value;
  }
}
