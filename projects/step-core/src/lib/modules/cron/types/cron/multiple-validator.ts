import { BaseCronValidator } from './_base-cron-validator';

export class MultipleValidator extends BaseCronValidator {
  private readonly validators: BaseCronValidator[];

  constructor(...validators: BaseCronValidator[]) {
    super();
    this.validators = validators;
  }

  override validate(source: unknown): boolean {
    for (const validator of this.validators) {
      if (validator.validate(source)) {
        return true;
      }
    }
    return false;
  }
}
