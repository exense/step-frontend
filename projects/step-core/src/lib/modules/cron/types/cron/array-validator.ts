import { BaseCronValidator } from './_base-cron-validator';

export class ArrayValidator extends BaseCronValidator {
  override validate(source: unknown): boolean {
    if (typeof source !== 'string' || !source.includes(',')) {
      return !!this.validator?.validate(source);
    }

    const sources = source.split(',');
    if (sources.length < 2) {
      return false;
    }

    for (const source of sources) {
      if (!this.validator?.validate(source)) {
        return false;
      }
    }

    return true;
  }
}
