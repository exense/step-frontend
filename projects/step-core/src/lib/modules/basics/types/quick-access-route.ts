import { Route } from '@angular/router';

export const ROUTE_ALIAS = Symbol('Route alias');

export const quickAccessRoute = (alias: string, config: Route): Route => {
  (config as any)[ROUTE_ALIAS] = alias;
  return config;
};
