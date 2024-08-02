import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { InfoBannerService } from '../injectables/info-banner.service';

export const infoBannerDeactivate: CanDeactivateFn<unknown> = () => {
  const _infoBanner = inject(InfoBannerService);
  _infoBanner.cleanupDisplayedInfo();
  return true;
};
