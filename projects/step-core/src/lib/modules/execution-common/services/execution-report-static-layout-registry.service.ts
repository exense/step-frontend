import { Injectable } from '@angular/core';
import { WidgetState } from '../../editable-grid-layout/types/widget-state';

export const EXECUTION_REPORT_LAYOUT_QUERY_PARAM = 'reportLayout';
export const EXECUTION_REPORT_LAYOUT_ROUTE_DATA = 'reportLayout';

export interface ExecutionReportStaticLayout {
  id: string;
  name: string;
  layout: {
    widgets: WidgetState[];
  };
  compactHeader?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ExecutionReportStaticLayoutRegistryService {
  private readonly layouts = new Map<string, ExecutionReportStaticLayout>();

  register(layout: ExecutionReportStaticLayout): void {
    this.layouts.set(layout.id, layout);
  }

  get(id?: string): ExecutionReportStaticLayout | undefined {
    return id ? this.layouts.get(id) : undefined;
  }

  has(id?: string): boolean {
    return !!this.get(id);
  }
}
