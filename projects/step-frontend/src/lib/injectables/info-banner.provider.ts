import { APP_INITIALIZER, FactoryProvider, inject } from '@angular/core';
import { InfoBannerService } from '@exense/step-core';

const FEATURES_DESCRIPTIONS: Record<string, string> = {
  plans: `<div>
    <strong>New plans features</strong>
    <ul>
      <li>Drag & Drop columns</li>
      <li>And more!</li>
      <li>Check <a href="https://step.exense.ch/" target="_blank">here</a></li>
    </ul>
   </div>`,
  executions: `
    <div>New <strong>executions</strong> view is coming soon!!!</div>
  `,
  plansEditor: `
    <div><strong>Explore</strong> new features in the plan editor!</div>
  `,
};

export const INFO_BANNER_PROVIDER: FactoryProvider = {
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: () => {
    const _infoBanner = inject(InfoBannerService);
    return () => {
      _infoBanner.register(FEATURES_DESCRIPTIONS);
      return true;
    };
  },
};
