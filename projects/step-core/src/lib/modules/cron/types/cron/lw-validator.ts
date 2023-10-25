import { BaseCronValidator } from './_base-cron-validator';

export class LWValidator extends BaseCronValidator {
  override validate(source: unknown): boolean {
    if (source === 'L' || source === 'LW') {
      return true;
    }

    if (source === 'W' || source === 'WL') {
      return false;
    }

    if (typeof source !== 'string' || !source.includes('W') || source.includes('WED')) {
      return !!this.validator?.validate(source);
    }

    if (source[source.length - 1] !== 'W') {
      return false;
    }

    return !!this.validator?.validate(source.substring(0, source.length - 1));
  }
}
