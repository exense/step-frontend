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

export interface ExecutionReportStaticRoute {
  path: string;
  layoutId: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExecutionReportStaticLayoutRegistryService {
  private readonly layouts = new Map<string, ExecutionReportStaticLayout>();
  private readonly routes: ExecutionReportStaticRoute[] = [];
  private routeRegistrar?: (route: ExecutionReportStaticRoute) => void;

  register(layout: ExecutionReportStaticLayout): void {
    this.layouts.set(layout.id, layout);
  }

  get(id?: string): ExecutionReportStaticLayout | undefined {
    return id ? this.layouts.get(id) : undefined;
  }

  has(id?: string): boolean {
    return !!this.get(id);
  }

  registerRoute(route: ExecutionReportStaticRoute): void {
    this.routes.push(route);
    this.routeRegistrar?.(route);
  }

  setRouteRegistrar(registrar: (route: ExecutionReportStaticRoute) => void): void {
    this.routeRegistrar = registrar;
    this.routes.forEach((route) => registrar(route));
  }
}
