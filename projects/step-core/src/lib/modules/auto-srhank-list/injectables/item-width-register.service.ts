import { KeyValue } from '@angular/common';

export abstract class ItemWidthRegisterService {
  abstract registerWidth(item: KeyValue<string, string>, width: number): void;
}
