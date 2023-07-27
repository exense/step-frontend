/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AttributeStats } from './AttributeStats';

export type MeasurementsStats = {
  count: number;
  attributes: Array<string>;
  values?: Record<string, Array<AttributeStats>>;
};
