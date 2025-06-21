export enum TimeUnit {
  MILLISECOND = 1,
  SECOND = 1000,
  MINUTE = TimeUnit.SECOND * 60,
  HOUR = TimeUnit.MINUTE * 60,
  DAY = TimeUnit.HOUR * 24,
  WEEK = TimeUnit.DAY * 7,
  MONTH = TimeUnit.DAY * 31,
  YEAR = TimeUnit.DAY * 365,
}

export const TIME_UNIT_DICTIONARY = {
  ms: TimeUnit.MILLISECOND,
  s: TimeUnit.SECOND,
  m: TimeUnit.MINUTE,
  h: TimeUnit.HOUR,
  d: TimeUnit.DAY,
  w: TimeUnit.WEEK,
  mo: TimeUnit.MONTH,
  y: TimeUnit.YEAR,
};

export const TIME_UNIT_LABELS = Object.entries(TIME_UNIT_DICTIONARY).reduce(
  (res, [key, label]) => {
    res[label] = key;
    return res;
  },
  {} as Record<TimeUnit, string>,
);

export type TimeUnitDictKey = keyof typeof TIME_UNIT_DICTIONARY;
