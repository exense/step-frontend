import { InjectionToken } from '@angular/core';
import { SpecialMimeType } from '../types/special-mime-type.enum';

export const MIME_TYPES = new InjectionToken<ReadonlySet<SpecialMimeType>>(
  'Set of special mime types used by application',
  {
    providedIn: 'root',
    factory: () => new Set<SpecialMimeType>([SpecialMimeType.PLAYWRIGHT_TRACE]),
  },
);
