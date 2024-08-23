import { NumberValidator } from './number-validator';
import { MonthValidator } from './month-validator';
import { DayOfWeekValidator } from './day-of-week-validator';
import { BaseCronValidator } from './_base-cron-validator';
import { AllValidator } from './all-validator';
import { ArrayValidator } from './array-validator';
import { MultipleValidator } from './multiple-validator';
import { IncrementValidator } from './increment-validator';
import { RangeValidator } from './range-validator';
import { NoSpecificValidator } from './no-specific-validator';
import { LWValidator } from './lw-validator';
import { NextDayValidator } from './next-day-validator';

export class CronValidatorsFactory {
  private secondsAndMinutes = new NumberValidator(0, 59);
  private hours = new NumberValidator(0, 23);
  private daysOfMonths = new NumberValidator(1, 32);
  private years = new NumberValidator(1970, 2199);
  private months = new MonthValidator(new NumberValidator(1, 12));
  private weekDays = new DayOfWeekValidator(new NumberValidator(1, 7));

  static readonly instance = new CronValidatorsFactory();

  private constructor() {}

  createSecondsMinutesValidator(): BaseCronValidator {
    return this.createValidatorWithCommonRules(this.secondsAndMinutes);
  }

  createHoursValidator(): BaseCronValidator {
    return this.createValidatorWithCommonRules(this.hours);
  }

  createDayOfMonthValidator(): BaseCronValidator {
    return new AllValidator(
      new NoSpecificValidator(
        new LWValidator(
          new ArrayValidator(
            new MultipleValidator(
              new IncrementValidator(new RangeValidator(this.daysOfMonths)),
              new RangeValidator(this.daysOfMonths),
            ),
          ),
        ),
      ),
    );
  }

  createMonthsValidator(): BaseCronValidator {
    return this.createValidatorWithCommonRules(this.months);
  }

  createDayOfWeekValidator(): BaseCronValidator {
    return new AllValidator(
      new NoSpecificValidator(
        new LWValidator(
          new ArrayValidator(
            new MultipleValidator(
              new IncrementValidator(new RangeValidator(this.weekDays)),
              new RangeValidator(this.weekDays),
              new NextDayValidator(this.weekDays),
            ),
          ),
        ),
      ),
    );
  }

  createYearsValidator(): BaseCronValidator {
    return this.createValidatorWithCommonRules(this.years);
  }

  private createValidatorWithCommonRules(validator: BaseCronValidator): BaseCronValidator {
    return new AllValidator(
      new ArrayValidator(
        new MultipleValidator(new IncrementValidator(new RangeValidator(validator)), new RangeValidator(validator)),
      ),
    );
  }
}
