export interface SpecialLinksStrategy {
  settings(): string;
  userSettings(): string;
  adminSettings(): string;
}
