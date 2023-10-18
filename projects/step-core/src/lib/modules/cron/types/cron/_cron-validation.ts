import { BaseCronValidator } from './_base-cron-validator';
import { CronValidatorsFactory } from './_cron-validators-factory';

export class CronValidation {
  static validate(cronExpression?: string): boolean {
    if (!cronExpression) {
      return true;
    }

    const parts = cronExpression.split(' ');
    if (parts.length < 6 || parts.length > 7) {
      return false;
    }

    if ((parts[3] === '?' && parts[5] === '?') || (parts[3] !== '?' && parts[5] !== '?')) {
      return false;
    }

    for (let i = 0; i < parts.length; i++) {
      let validator!: BaseCronValidator;
      switch (i) {
        case 0:
          validator = CronValidatorsFactory.instance.createSecondsMinutesValidator();
          break;
        case 1:
          validator = CronValidatorsFactory.instance.createSecondsMinutesValidator();
          break;
        case 2:
          validator = CronValidatorsFactory.instance.createHoursValidator();
          break;
        case 3:
          validator = CronValidatorsFactory.instance.createDayOfMonthValidator();
          break;
        case 4:
          validator = CronValidatorsFactory.instance.createMonthsValidator();
          break;
        case 5:
          validator = CronValidatorsFactory.instance.createDayOfWeekValidator();
          break;
        case 6:
          validator = CronValidatorsFactory.instance.createYearsValidator();
          break;
      }

      if (!validator.validate(parts[i])) {
        return false;
      }
    }

    return true;
  }
}
