import { Route } from '@angular/router';
import { Type } from '@angular/core';
import { DialogRouteComponent } from '../components/dialog-route/dialog-route.component';
import { Observable } from 'rxjs';
import { MatDialogConfig } from '@angular/material/dialog';

type DialogRouteWithComponent = Omit<Route, 'component'> & {
  dialogComponent: Type<unknown>;
};

type DialogRouteWithComponentResolve = Omit<Route, 'component'> & {
  resolveDialogComponent: () => Type<unknown> | Promise<Type<unknown>> | Observable<Type<unknown>>;
};

type DialogRoute = DialogRouteWithComponent | DialogRouteWithComponentResolve;

export const dialogRoute = (config: DialogRoute, dialogConfig?: MatDialogConfig): Route => {
  if ((config as DialogRouteWithComponent).dialogComponent) {
    const dialogComponent = (config as DialogRouteWithComponent).dialogComponent;
    delete (config as Partial<DialogRouteWithComponent>).dialogComponent;
    config.data = { ...(config.data ?? {}), dialogComponent, dialogConfig };
  } else if ((config as DialogRouteWithComponentResolve).resolveDialogComponent) {
    const dialogComponent = (config as DialogRouteWithComponentResolve).resolveDialogComponent;
    delete (config as Partial<DialogRouteWithComponentResolve>).resolveDialogComponent;
    config.data = { ...(config.data ?? {}), dialogConfig };
    config.resolve = { ...(config.resolve ?? {}), dialogComponent };
  }
  return {
    ...config,
    component: DialogRouteComponent,
  };
};
