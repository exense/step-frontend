import { InjectionToken } from '@angular/core';

export const AVATAR_COLOR_PREFERENCE_KEY = new InjectionToken('Avatar color preference key', {
  factory: () => 'avatar_color',
});
