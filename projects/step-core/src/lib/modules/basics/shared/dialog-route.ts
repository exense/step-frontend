import { Route } from '@angular/router';
import { Type } from '@angular/core';
import { DialogRouteComponent } from '../components/dialog-route/dialog-route.component';

type DialogRoute = Omit<Route, 'component'> & {
  dialogComponent: Type<unknown>;
};

export const dialogRoute = (config: DialogRoute): Route => {
  const dialogComponent = config['dialogComponent'];
  delete (config as Partial<DialogRoute>)['dialogComponent'];
  config.data = { ...(config.data ?? {}), dialogComponent };
  return {
    ...config,
    component: DialogRouteComponent,
  };
};
