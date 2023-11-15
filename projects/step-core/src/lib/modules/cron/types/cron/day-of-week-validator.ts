import { BaseCronValidator } from './_base-cron-validator';

const DAYS: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export class DayOfWeekValidator extends BaseCronValidator {
  override validate(source: unknown): boolean {
    return !!this.validator?.validate(this.getWeekIndex(source as string));
  }

  private getWeekIndex(source: string): string {
    if (DAYS.includes(source)) {
      return (DAYS.indexOf(source) + 1).toString();
    }
    return source;
  }
}
