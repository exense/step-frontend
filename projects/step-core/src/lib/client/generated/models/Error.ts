/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Error = {
    type?: 'TECHNICAL' | 'BUSINESS';
    layer?: string;
    msg?: string;
    code?: number;
    root?: boolean;
};

