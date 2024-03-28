/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ScreenInputColumnSettings = {
  type: 'all-of',
  contains: [
    {
      type: 'ColumnSettings',
    },
    {
      properties: {
        screenInput: {
          type: 'ScreenInput',
        },
      },
    },
  ],
} as const;
