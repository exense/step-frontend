import { BaseCronValidator } from './_base-cron-validator';

export class NextDayValidator extends BaseCronValidator {
  override validate(source: unknown): boolean {
    if (typeof source !== 'string' || !source.includes('#')) {
      return super.validate(source);
    }

    const parts = source.split('#');
    if (parts.length !== 2) {
      return false;
    }

    const nextDay = parseInt(parts[1]);

    const result = parts[0] === '' || (!!this.validator?.validate(parts[0]) && !isNaN(nextDay) && nextDay <= 5);

    return result;
  }
}
