import { BaseCronValidator } from './_base-cron-validator';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export class MonthValidator extends BaseCronValidator {
  override validate(source: unknown): boolean {
    return !!this.validator?.validate(this.getMonthIndex(source as string));
  }

  private getMonthIndex(source: string): string {
    if (MONTHS.includes(source)) {
      return MONTHS.indexOf(source).toString();
    }
    return source;
  }
}
