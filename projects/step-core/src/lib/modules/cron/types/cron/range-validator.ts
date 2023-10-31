import { BaseCronValidator } from './_base-cron-validator';

export class RangeValidator extends BaseCronValidator {
  override validate(source: unknown): boolean {
    if (typeof source !== 'string' || !source.includes('-')) {
      return !!this.validator?.validate(source);
    }

    const parts = source.split('-');
    if (parts.length !== 2) {
      return false;
    }

    const res =
      this.validator!.validate(parts[0]) &&
      this.validator!.validate(parts[1]) &&
      this.validator!.valToNumber(parts[0]) > this.validator!.valToNumber(parts[1]);

    return res;
  }
}
