import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { InfoBannerService } from '../injectables/info-banner.service';

export const infoBannerActivate = (bannerKey: string): CanActivateFn => {
  return () => {
    const _infoBanner = inject(InfoBannerService);

    const hasInfoBanner = _infoBanner.hasInfo(bannerKey);

    if (hasInfoBanner) {
      return _infoBanner.displayInfo(bannerKey);
    }

    return true;
  };
};
