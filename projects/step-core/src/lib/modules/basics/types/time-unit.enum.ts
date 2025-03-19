export enum TimeUnit {
  MILLISECOND = 1,
  SECOND = 1000,
  MINUTE = TimeUnit.SECOND * 60,
  HOUR = TimeUnit.MINUTE * 60,
  DAY = TimeUnit.HOUR * 24,
}

export const TIME_UNIT_DICTIONARY = {
  ms: TimeUnit.MILLISECOND,
  s: TimeUnit.SECOND,
  m: TimeUnit.MINUTE,
  h: TimeUnit.HOUR,
  d: TimeUnit.DAY,
};

export const TIME_UNIT_LABELS = Object.entries(TIME_UNIT_DICTIONARY).reduce(
  (res, [key, label]) => {
    res[label] = key;
    return res;
  },
  {} as Record<TimeUnit, string>,
);

export type TimeUnitDictKey = keyof typeof TIME_UNIT_DICTIONARY;
