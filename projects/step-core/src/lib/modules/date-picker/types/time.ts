import { DateTime } from 'luxon';

export type Time = Pick<DateTime, 'hour' | 'minute' | 'second'>;
