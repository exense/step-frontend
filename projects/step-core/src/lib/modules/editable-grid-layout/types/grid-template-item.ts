import { TemplateRef } from '@angular/core';

export interface GridTemplateItem {
  readonly widgetType: string;
  readonly templateRef: TemplateRef<unknown>;
  readonly autoHeightOnFirstRow: boolean;
}
