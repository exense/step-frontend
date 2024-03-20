import { Route } from '@angular/router';
import { SUB_ROUTE_DATA } from './constants';

export const routesPrioritySortPredicate = (routeA: Route, routeB: Route) => {
  const weightA = routeA.data?.[SUB_ROUTE_DATA]?.weight ?? 1;
  const weightB = routeB.data?.[SUB_ROUTE_DATA]?.weight ?? 1;
  return weightA - weightB;
};
