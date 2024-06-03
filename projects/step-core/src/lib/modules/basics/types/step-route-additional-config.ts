import { Route } from '@angular/router';

const STEP_ROUTE_ADDITIONAL_CONFIG = Symbol('Step route additional config');

export interface StepRouteAdditionalConfig {
  quickAccessAlias?: string;
  infoBannerKey?: string;
}

export const stepRouteAdditionalConfig = (additionalConfig: StepRouteAdditionalConfig, config: Route): Route => {
  (config as any)[STEP_ROUTE_ADDITIONAL_CONFIG] = additionalConfig;
  return config;
};

export const getAdditionalConfig = (config: Route): StepRouteAdditionalConfig | undefined => {
  return (config as any)[STEP_ROUTE_ADDITIONAL_CONFIG];
};
