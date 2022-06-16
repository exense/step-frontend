/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type AccessConfiguration = {
    authentication?: boolean;
    authenticatorName?: string;
    demo?: boolean;
    debug?: boolean;
    noLoginMask?: boolean;
    roles?: Array<string>;
    miscParams?: Record<string, string>;
    defaultUrl?: string;
    title?: string;
    displayLegacyPerfDashboard?: boolean;
    displayNewPerfDashboard?: boolean;
};

