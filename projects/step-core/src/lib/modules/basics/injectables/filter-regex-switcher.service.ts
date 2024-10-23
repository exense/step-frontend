import { Signal } from '@angular/core';

export abstract class FilterRegexSwitcherService {
  abstract readonly isRegex: Signal<boolean>;
  abstract switchToText(): void;
  abstract switchToRegex(): void;
}
