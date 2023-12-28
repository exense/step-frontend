export abstract class DateAdapterService<D> {
  abstract format(date: D | null | undefined, withTime: boolean): string;
  abstract parse(dateStr: string, withTime: boolean): D | null | undefined;
  abstract areEqual(a: D | null | undefined, b: D | null | undefined): boolean;
}
