export interface Tab<T extends string | number> {
  id: T;
  label?: string;
  link?: string;
}
