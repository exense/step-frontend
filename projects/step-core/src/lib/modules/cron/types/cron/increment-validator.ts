import { BaseCronValidator } from './_base-cron-validator';

const REGEX_NUM = /^\d+$/;

export class IncrementValidator extends BaseCronValidator {
  override validate(source: unknown): boolean {
    if (typeof source !== 'string' || !source.includes('/')) {
      return !!this.validator?.validate(source);
    }

    if (source[0] === '/') {
      return false;
    }

    const parts = source.split('/');
    if (parts.length > 2) {
      return false;
    }

    if (parts[0] !== '*' && !this.validator?.validate(parts[0])) {
      return false;
    }

    if (!REGEX_NUM.test(parts[1]) || parseInt(parts[1]) <= 0) {
      return false;
    }

    return true;
  }
}
