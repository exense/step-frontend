import { TemplateRef } from '@angular/core';

export interface SearchColumn {
  colName: string;
  searchName?: string;
  template?: TemplateRef<any>;
}
