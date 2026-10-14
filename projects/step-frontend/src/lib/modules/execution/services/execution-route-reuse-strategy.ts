import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';

export const RECREATE_ON_EXECUTION_CHANGE = 'recreateOnExecutionChange';

@Injectable()
export class ExecutionRouteReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    if (
      future.routeConfig === current.routeConfig &&
      future.data[RECREATE_ON_EXECUTION_CHANGE] &&
      future.paramMap.get('id') !== current.paramMap.get('id')
    ) {
      return false;
    }
    return super.shouldReuseRoute(future, current);
  }
}
