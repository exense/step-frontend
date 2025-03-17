export type PlainMultiLevelItem<T> = { value: T; label: string; level: number; parent?: PlainMultiLevelItem<T> };
