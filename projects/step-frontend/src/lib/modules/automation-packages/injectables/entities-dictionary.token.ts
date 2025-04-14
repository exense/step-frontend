import { InjectionToken } from '@angular/core';
import { AutomationPackageEntityKey } from '../types/automation-package-entity-key.enum';

export const ENTITIES_DICTIONARY = new InjectionToken<Record<AutomationPackageEntityKey, string>>(
  'Automation package entities dictionary',
  {
    providedIn: 'root',
    factory: () => ({
      [AutomationPackageEntityKey.KEYWORDS]: 'functions',
      [AutomationPackageEntityKey.PLANS]: 'plans',
      [AutomationPackageEntityKey.PARAMETERS]: 'parameters',
      [AutomationPackageEntityKey.SCHEDULES]: 'tasks',
    }),
  },
);
