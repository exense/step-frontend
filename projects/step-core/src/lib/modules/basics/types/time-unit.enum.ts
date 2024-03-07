export enum TimeUnit {
  MILLISECOND = 1,
  SECOND = 1000,
  MINUTE = TimeUnit.SECOND * 60,
  HOUR = TimeUnit.MINUTE * 60,
  DAY = TimeUnit.HOUR * 24,
}
