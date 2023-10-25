export class BaseCronValidator {
  constructor(protected validator?: BaseCronValidator) {}

  valToNumber(value: unknown): number {
    const res = value ? new Number(value) : NaN;
    return res as number;
  }

  validate(source: unknown): boolean {
    return true;
  }
}
