import { DateTime } from 'luxon';
import { Time } from './time';

export const extractTime = (date?: DateTime | null): Time | undefined => {
  if (!date) {
    return undefined;
  }
  const { hour, minute, second } = date;
  return { hour, minute, second };
};
