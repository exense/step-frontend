import { BaseCronValidator } from './_base-cron-validator';
import { source } from '@angular-devkit/schematics';

export class NumberValidator extends BaseCronValidator {
  constructor(private min: number, private max: number) {
    super();
  }

  override validate(source: unknown): boolean {
    const s = this.valToNumber(source);
    return !isNaN(s) && s >= this.min && s <= this.max;
  }
}
