import { BaseCronValidator } from './_base-cron-validator';

export class LValidator extends BaseCronValidator {
  override validate(source: unknown): boolean {
    if (typeof source !== 'string' || !source.includes('L')) {
      return !!this.validator?.validate(source);
    }

    if (source[source.length - 1] !== 'L') {
      return false;
    }

    return !!this.validator?.validate(source.substring(0, source.length - 1));
  }
}
