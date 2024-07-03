/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ColumnSelection = {
  column: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'PCL_80' | 'PCL_90' | 'PCL_99' | 'TPS' | 'TPH';
  selected?: boolean;
  type: string;
};
