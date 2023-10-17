import { BaseCronValidator } from './_base-cron-validator';

export class NoSpecificValidator extends BaseCronValidator {
  override validate(source: unknown): boolean {
    if (source === '?') {
      return true;
    }
    return !!this.validator?.validate(source);
  }
}
